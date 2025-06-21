from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=200)
    type = serializers.CharField()
    lat = serializers.FloatField()
    lng = serializers.FloatField()

class TripInfoSerializer(serializers.Serializer):
    date = serializers.DateField()
    currentLocation = LocationSerializer()
    pickupLocation  = LocationSerializer()
    dropoffLocation = LocationSerializer()