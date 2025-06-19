from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripInfoSerializer
from .utils import calculate_route, compute_route_events
from .constants import MILE_IN_METERS

class RouteAPIView(APIView):
    def post(self, request):
        serializer = TripInfoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        
        route = calculate_route([data['currentLocation'], data['pickupLocation'], data['dropoffLocation']])
        
        calculated_route = route['routes'][0]
        geometry = calculated_route['geometry']['coordinates']
        distances = []
        durations = []
        for leg in calculated_route['legs']:
            distances.extend(leg['annotation']['distance'])
            durations.extend(leg['annotation']['duration'])

        events = compute_route_events(geometry, distances, durations)
        return Response({
          'path': geometry,
          'distance_meters': round(calculated_route['distance'] / MILE_IN_METERS, 1),
          'duration_seconds': calculated_route['duration'],
          'events': events
        })        
