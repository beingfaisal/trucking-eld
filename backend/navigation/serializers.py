"""Serializers for trip input data and locations."""

from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    """Serializer for a geographic location with address and coordinates."""
    address = serializers.CharField(max_length=200)
    type = serializers.CharField(max_length=50)
    lat = serializers.FloatField()
    lng = serializers.FloatField()


class TripInfoSerializer(serializers.Serializer):
    """Serializer for trip details including date and waypoints."""
    date = serializers.DateField()
    currentLocation = LocationSerializer()
    pickupLocation = LocationSerializer()
    dropoffLocation = LocationSerializer()
