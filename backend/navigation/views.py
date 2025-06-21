"""API view for calculating routes and related events."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import TripInfoSerializer
from .utils import (
    calculate_route,
    compute_route_events,
    calculate_employee_time,
)


class RouteAPIView(APIView):
    """APIView to handle route calculation."""

    def post(self, request) -> Response:
        """
        Accepts JSON with currentLocation, pickupLocation,
        dropoffLocation, date.
        Returns path, distance, duration, and computed events.
        """
        serializer = TripInfoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        current_location = data["currentLocation"]
        pickup_location = data["pickupLocation"]
        dropoff_location = data["dropoffLocation"]

        osrm_response = calculate_route(
            [current_location, pickup_location, dropoff_location]
        )
        route_data = osrm_response["routes"][0]
        geometry = route_data["geometry"]["coordinates"]

        distances = []
        durations = []
        for leg in route_data["legs"]:
            distances.extend(leg["annotation"]["distance"])
            durations.extend(leg["annotation"]["duration"])

        trip_stops = {
            (data["currentLocation"]["lng"], data["currentLocation"]["lat"]): {
                "type": "start",
            },
            (data["pickupLocation"]["lng"], data["pickupLocation"]["lat"]): {
                "type": "pickup",
            },
            (data["dropoffLocation"]["lng"], data["dropoffLocation"]["lat"]): {
                "type": "dropoff",
            }
        }

        events = compute_route_events(
            geometry, distances, durations, trip_stops
        )
        timed_events = calculate_employee_time(events, data["date"])

        return Response({
                "path": geometry,
                "distance_meters": route_data["distance"],
                "duration_seconds": route_data["duration"],
                "events": timed_events,
            },
            status=status.HTTP_200_OK,
        )
