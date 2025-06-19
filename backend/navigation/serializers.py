from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=200)
    lat = serializers.FloatField()
    lng = serializers.FloatField()

class TripInfoSerializer(serializers.Serializer):
    date = serializers.DateField()
    driverNumber = serializers.CharField(max_length=7)
    driverName = serializers.CharField(max_length=100)
    homeOperatingCenter = serializers.CharField(max_length=200)
    truckNumber = serializers.CharField(max_length=50)
    trailerNumbers = serializers.ListField(
        child=serializers.CharField(max_length=50), required=False
    )
    shipperName = serializers.CharField(max_length=200)
    commodityName = serializers.CharField(max_length=200)
    loadNumbers = serializers.ListField(
        child=serializers.CharField(max_length=50), required=False
    )
    currentLocation = LocationSerializer()
    pickupLocation  = LocationSerializer()
    dropoffLocation = LocationSerializer()