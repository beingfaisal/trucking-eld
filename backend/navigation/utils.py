import requests
import itertools
import math
from bisect import bisect_left
from .constants import OSRM_URL, MILE_IN_METERS, SECONDS_IN_HOUR, FUEL_STOP_DISTANCE, DAILY_DRIVING_LIMIT_HRS, REQUIRED_BREAK_HRS_THRESHOLD

def calculate_route(coordinates_list):
    compiled_coords = ';'.join([f"{coord['lng']},{coord['lat']}" for coord in coordinates_list])
    params = {
        'overview': 'full',
        'geometries': 'geojson',
        'annotations': 'true'
    }
    url = f"{OSRM_URL}/{compiled_coords}"
    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise ValueError(f"OSRM request failed with status {response.status_code}: {response.text}")

    return response.json()


def calculate_linear_interpolation(geometry, cumulative_prop, cutoff_index, threshold):
    if cutoff_index == 0 or cutoff_index >= len(geometry):
        return geometry[-1]

    prev_segment = cumulative_prop[cutoff_index - 1]
    current_segment = cumulative_prop[cutoff_index] - prev_segment
    ratio = (threshold - prev_segment) / current_segment if current_segment > 0 else 0
    lng1, lat1 = geometry[cutoff_index - 1]
    lng2, lat2 = geometry[cutoff_index]
    return [
        lng1 + (lng2 - lng1) * ratio,
        lat1 + (lat2 - lat1) * ratio
    ]


def calculate_distance_breaks(geometry, events, cumulative_dist, total_dist):
    distance_covered = FUEL_STOP_DISTANCE
    while distance_covered < total_dist:
        cutoff_ind = bisect_left(cumulative_dist, distance_covered)
        event_loc = calculate_linear_interpolation(geometry, cumulative_dist, cutoff_ind, distance_covered)
        events.append({
            'type': 'fuel_stop',
            'mile_marker': round(distance_covered / MILE_IN_METERS, 1),
            'location': event_loc,
        })
        distance_covered += FUEL_STOP_DISTANCE

    return events 

def calculate_time_breaks(geometry, events, cumulative_time, total_time):

    total_driving_time = REQUIRED_BREAK_HRS_THRESHOLD * SECONDS_IN_HOUR
    current_driving_hrs = REQUIRED_BREAK_HRS_THRESHOLD

    while total_driving_time < total_time:
        cutoff_ind = bisect_left(cumulative_time, total_driving_time)
        event_loc = calculate_linear_interpolation(geometry, cumulative_time, cutoff_ind, total_driving_time)
        events.append({
            'type': 'day_end' if current_driving_hrs >= DAILY_DRIVING_LIMIT_HRS else 'break_30m',
            'time_marker_h': total_driving_time / SECONDS_IN_HOUR,
            'location': event_loc
        })

        if current_driving_hrs >= DAILY_DRIVING_LIMIT_HRS: # Means a day ended so we add the next 8 hrs limit into the total driving time
            total_driving_time += REQUIRED_BREAK_HRS_THRESHOLD * SECONDS_IN_HOUR
            current_driving_hrs = REQUIRED_BREAK_HRS_THRESHOLD
        else: # Means that driver has done his first 8 hr of driving and now we add the remaining daily driving limit
            remaining_daily_hrs = DAILY_DRIVING_LIMIT_HRS - REQUIRED_BREAK_HRS_THRESHOLD
            total_driving_time += remaining_daily_hrs * SECONDS_IN_HOUR
            current_driving_hrs = DAILY_DRIVING_LIMIT_HRS

    return events

def compute_route_events(geometry, distances, durations):
    cumulative_dist = [0.0] + list(itertools.accumulate(distances))
    cumulative_time = [0.0] + list(itertools.accumulate(durations))
    total_dist = cumulative_dist[-1]
    total_time = cumulative_time[-1]

    events = []
    calculate_distance_breaks(geometry, events, cumulative_dist, total_dist)
    calculate_time_breaks(geometry, events, cumulative_time, total_time)
    return events
