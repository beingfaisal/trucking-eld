import requests
import itertools
from  datetime import datetime, time, timedelta
from bisect import bisect_left
from .constants import OSRM_URL, MILE_IN_METERS, SECONDS_IN_HOUR, FUEL_STOP_DISTANCE, DAILY_DRIVING_LIMIT_HRS, REQUIRED_BREAK_HRS_THRESHOLD, TRIP_STOP_DURATIONS_IN_HRS

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
    return (
        lng1 + (lng2 - lng1) * ratio,
        lat1 + (lat2 - lat1) * ratio
    )


def calculate_distance_breaks(geometry, cumulative_dist, total_dist):
    fuel_stops = {}
    distance_covered = FUEL_STOP_DISTANCE
    while distance_covered < total_dist:
        cutoff_ind = bisect_left(cumulative_dist, distance_covered)
        event_loc = calculate_linear_interpolation(geometry, cumulative_dist, cutoff_ind, distance_covered)
        fuel_stops[event_loc] = {
            'type': 'fuel_stop'
        }
        distance_covered += FUEL_STOP_DISTANCE

    return fuel_stops 

def calculate_time_breaks(geometry, cumulative_time, total_time):
    break_stops = {}

    total_driving_time = REQUIRED_BREAK_HRS_THRESHOLD * SECONDS_IN_HOUR
    current_driving_hrs = REQUIRED_BREAK_HRS_THRESHOLD

    while total_driving_time < total_time:
        cutoff_ind = bisect_left(cumulative_time, total_driving_time)
        event_loc = calculate_linear_interpolation(geometry, cumulative_time, cutoff_ind, total_driving_time)
        break_stops[event_loc] = {
            'type': 'duty_break' if current_driving_hrs >= DAILY_DRIVING_LIMIT_HRS else 'rest_30m'
        }

        if current_driving_hrs >= DAILY_DRIVING_LIMIT_HRS: # Means a day ended so we add the next 8 hrs limit into the total driving time
            total_driving_time += REQUIRED_BREAK_HRS_THRESHOLD * SECONDS_IN_HOUR
            current_driving_hrs = REQUIRED_BREAK_HRS_THRESHOLD
        else: # Means that driver has done his first 8 hr of driving and now we add the remaining daily driving limit
            remaining_daily_hrs = DAILY_DRIVING_LIMIT_HRS - REQUIRED_BREAK_HRS_THRESHOLD
            total_driving_time += remaining_daily_hrs * SECONDS_IN_HOUR
            current_driving_hrs = DAILY_DRIVING_LIMIT_HRS

    return break_stops


def calculate_progress_at_coordinates(geometry, cumulative_dist, cumulative_time, corrdinates):
    events = []

    for coord in corrdinates.keys():
        lng, lat = coord[0], coord[1]

        best_idx = min(
            range(len(geometry)),
            key=lambda i: (geometry[i][0] - lng)**2 + (geometry[i][1] - lat)**2
        )

        events.append({
            'type': corrdinates[coord]['type'],
            'location': [lng, lat],
            'mile_marker': round(cumulative_dist[best_idx] / MILE_IN_METERS, 2),
            'time_marker_h': round(cumulative_time[best_idx] / SECONDS_IN_HOUR, 2),
        })

    return events


def calculate_employee_time(events, date):
    events.sort(key=lambda x: x['mile_marker'])
    trip_time = datetime.combine(date, time(hour=8, minute=0))
    for event in events:
        break_time = TRIP_STOP_DURATIONS_IN_HRS[event['type']]
        arrival_time = trip_time + timedelta(hours=event['time_marker_h'])
        departure_time = arrival_time + timedelta(hours=break_time)
        event['arrival_time'] = arrival_time.strftime('%Y-%m-%d %H:%M:%S')
        event['departure_time'] = departure_time.strftime('%Y-%m-%d %H:%M:%S')
    return events


def compute_route_events(geometry, distances, durations, trip_stops):
    cumulative_dist = [0.0] + list(itertools.accumulate(distances))
    cumulative_time = [0.0] + list(itertools.accumulate(durations))
    total_dist = cumulative_dist[-1]
    total_time = cumulative_time[-1]

    fuel_stops = calculate_distance_breaks(geometry, cumulative_dist, total_dist)
    break_stops = calculate_time_breaks(geometry, cumulative_time, total_time)
    total_trip_stops = {**trip_stops, **fuel_stops, **break_stops}
    events = calculate_progress_at_coordinates(geometry, cumulative_dist, cumulative_time, total_trip_stops)
    return events
