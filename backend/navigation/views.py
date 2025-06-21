from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripInfoSerializer
from .utils import calculate_route, compute_route_events, calculate_employee_time


class RouteAPIView(APIView):
    def post(self, request):
        serializer = TripInfoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        waypoints = [data['currentLocation'], data['pickupLocation'], data['dropoffLocation']]
        
        route = calculate_route(waypoints)
        
        calculated_route = route['routes'][0]
        geometry = calculated_route['geometry']['coordinates']
        distances = []
        durations = []
        for leg in calculated_route['legs']:
            distances.extend(leg['annotation']['distance'])
            durations.extend(leg['annotation']['duration'])
        
        trip_stops = {
            (data['currentLocation']['lng'], data['currentLocation']['lat']): {
                'type': 'start',
            },
            (data['pickupLocation']['lng'], data['pickupLocation']['lat']): {
                'type': 'pickup',
            },
            (data['dropoffLocation']['lng'], data['dropoffLocation']['lat']): {
                'type': 'dropoff',
            }
        }

        events = compute_route_events(geometry, distances, durations, trip_stops)
        timed_events = calculate_employee_time(events, data['date'])
        return Response({
          'path': geometry,
          'distance_meters': calculated_route['distance'],
          'duration_seconds': calculated_route['duration'],
          'events': timed_events
        })        
