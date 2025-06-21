"""Constants for OSRM routing and event thresholds."""

OSRM_URL = "http://router.project-osrm.org/route/v1/driving"

MILE_IN_METERS = 1609.34
SECONDS_IN_HOUR = 3600

FUEL_STOP_DISTANCE = 1000 * MILE_IN_METERS
DAILY_DRIVING_LIMIT_HRS = 11
REQUIRED_BREAK_HRS_THRESHOLD = 8

TRIP_START = "start"
PICKUP = "pickup"
DROPOFF = "dropoff"
FUEL_STOP = "fuel_stop"
BREAK_30MIN = "rest_30m"
DUTY_END = "duty_break"

TRIP_STOP_DURATIONS_IN_HRS = {
    TRIP_START: 0,
    PICKUP: 1,
    DROPOFF: 1,
    FUEL_STOP: 0.5,
    BREAK_30MIN: 0.5,
    DUTY_END: 10,
}
