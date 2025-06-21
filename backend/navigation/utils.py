"""Utility functions for OSRM routing and event generation."""

import itertools
from datetime import datetime, time, timedelta
from bisect import bisect_left

import requests

from .constants import (
    OSRM_URL, MILE_IN_METERS, SECONDS_IN_HOUR, FUEL_STOP_DISTANCE,
    DAILY_DRIVING_LIMIT_HRS, REQUIRED_BREAK_HRS_THRESHOLD,
    TRIP_STOP_DURATIONS_IN_HRS
)


def calculate_route(coordinates_list) -> dict:
    """
    Query the OSRM API for a route through the given waypoints.

    Returns the parsed JSON response as a dict.
    """
    compiled = ";".join(f"{c['lng']},{c['lat']}" for c in coordinates_list)
    url = f"{OSRM_URL}/{compiled}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "annotations": "true",
    }
    response = requests.get(url, params=params, timeout=10)
    if response.status_code != 200:
        raise ValueError(
            f"OSRM request failed with status {response.status_code}"
        )
    return response.json()


def calculate_linear_interpolation(geometry, cumulative, index, threshold):
    """
    Find the closest vortex in the polyline from cumulative
    values of distance or time.
    """
    if index <= 0 or index >= len(geometry):
        return geometry[-1]
    prev_val = cumulative[index - 1]
    seg = cumulative[index] - prev_val
    ratio = (threshold - prev_val) / seg if seg > 0 else 0
    lng1, lat1 = geometry[index - 1]
    lng2, lat2 = geometry[index]
    return (
        lng1 + (lng2 - lng1) * ratio,
        lat1 + (lat2 - lat1) * ratio
    )


def calculate_distance_breaks(geometry, cumulative_dist, total_dist):
    """
    Determine fuel-stop points every FUEL_STOP_DISTANCE meters.

    Returns a dict mapping (lng, lat) tuples to event metadata.
    """
    stops = {}
    marker = FUEL_STOP_DISTANCE
    while marker < total_dist:
        idx = bisect_left(cumulative_dist, marker)
        loc = calculate_linear_interpolation(
            geometry, cumulative_dist, idx, marker
        )
        stops[loc] = {"type": "fuel_stop"}
        marker += FUEL_STOP_DISTANCE
    return stops


def calculate_time_breaks(geometry, cumulative_time, total_time):
    """
    Determine rest and duty-break points based on time thresholds.

    Rest every REQUIRED_BREAK_HRS_THRESHOLD hours; duty break every
    DAILY_DRIVING_LIMIT_HRS hours within a 14-hour window.
    Returns a dict mapping (lng, lat) to event metadata.
    """
    stops = {}
    next_break = REQUIRED_BREAK_HRS_THRESHOLD * SECONDS_IN_HOUR
    driven = REQUIRED_BREAK_HRS_THRESHOLD

    while next_break < total_time:
        idx = bisect_left(cumulative_time, next_break)
        loc = calculate_linear_interpolation(
            geometry, cumulative_time, idx, next_break
        )
        event_type = (
            "duty_break"
            if driven >= DAILY_DRIVING_LIMIT_HRS else "rest_30m"
        )
        stops[loc] = {"type": event_type}

        if driven >= DAILY_DRIVING_LIMIT_HRS:
            next_break += REQUIRED_BREAK_HRS_THRESHOLD * SECONDS_IN_HOUR
            driven = REQUIRED_BREAK_HRS_THRESHOLD
        else:
            remaining = DAILY_DRIVING_LIMIT_HRS - REQUIRED_BREAK_HRS_THRESHOLD
            next_break += remaining * SECONDS_IN_HOUR
            driven = DAILY_DRIVING_LIMIT_HRS

    return stops


def calculate_progress_at_coordinates(
    geometry, cumulative_dist, cumulative_time, coordinates
):
    """
    For each (lng, lat) key in `coordinates` dict, snap to the nearest
    route vertex and record cumulative distance & time at that point.
    Returns a list of event dicts.
    """
    events = []

    for coord in coordinates.keys():
        lng, lat = coord[0], coord[1]

        best_idx = min(
            range(len(geometry)),
            key=lambda i: (geometry[i][0] - lng)**2 + (geometry[i][1] - lat)**2
        )

        events.append({
            'type': coordinates[coord]['type'],
            'location': [lng, lat],
            'mile_marker': round(
                cumulative_dist[best_idx] / MILE_IN_METERS, 2
            ),
            'time_marker_h': round(
                cumulative_time[best_idx] / SECONDS_IN_HOUR, 2
            ),
        })

    return events


def calculate_employee_time(events, date):
    """
    Given a list of events (with time_marker_h), compute arrival &
    departure timestamps based on TRIP_STOP_DURATIONS_IN_HRS.
    Assumes shift starts at 08:00 on the given date.
    """
    current = datetime.combine(date, time(hour=8))
    for ev in events:
        duration = TRIP_STOP_DURATIONS_IN_HRS.get(ev["type"], 0)
        arrival = current + timedelta(hours=ev["time_marker_h"])
        departure = arrival + timedelta(hours=duration)
        ev["arrival_time"] = arrival.strftime("%Y-%m-%d %H:%M:%S")
        ev["departure_time"] = departure.strftime("%Y-%m-%d %H:%M:%S")
    return events


def compute_route_events(geometry, distances, durations, trip_stops):
    """
    Build cumulative distance/time and merge trip_stops with
    auto-generated fuel and time breaks. Returns a sorted list
    of all events with distance and time markers.
    """
    cumulative_dist = [0.0] + list(itertools.accumulate(distances))
    cumulative_time = [0.0] + list(itertools.accumulate(durations))
    total_dist = cumulative_dist[-1]
    total_time = cumulative_time[-1]

    fuel_stops = calculate_distance_breaks(
        geometry, cumulative_dist, total_dist
    )
    time_rest = calculate_time_breaks(
        geometry, cumulative_time, total_time
    )
    merged = {**trip_stops, **fuel_stops, **time_rest}

    events = calculate_progress_at_coordinates(
        geometry, cumulative_dist, cumulative_time, merged
    )
    events.sort(key=lambda e: e["mile_marker"])
    return events
