import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoadScript, GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import Banner from '../components/Banner';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '500px' };

export default function RouteInfo() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.routeData) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  if (loadError) return <p className="p-4 text-center">Error loading maps</p>;
  if (!isLoaded) return <p className="p-4 text-center">Loading map…</p>;
  if (!location.state?.routeData) return null;

  const { path, events, distance_meters, duration_seconds } = location.state.routeData;

  // python osmr library returns path as an array of [lng, lat] pairs but for Google Maps we need { lat, lng } objects
  const pathCoords = path.map(([lng, lat]) => ({ lat, lng }));
  const center = pathCoords[Math.floor(pathCoords.length / 2)];
  const start = pathCoords[0];
  const end = pathCoords[pathCoords.length - 1];

  const iconMap = {
    fuel_stop: '⛽',
    break_30m: '⏱',
    day_end: '🌙',
  };

  return (
    <>
      <Banner />
      <main className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Trip Route & Events</h2>
        <div className="rounded-lg overflow-hidden shadow-md">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={8}
          >
            <Polyline
              path={pathCoords}
              options={{ strokeColor: '#0077FF', strokeOpacity: 0.8, strokeWeight: 4 }}
            />

            <Marker
                position={start}
                label={{
                text: 'Start',
                className: 'bg-white rounded px-1 text-sm',
                }}
            />

            <Marker
                position={end}
                label={{
                text: 'End',
                className: 'bg-white rounded px-1 text-sm',
                }}
            />
            {events.map((evt, i) => (
              <Marker
                key={i}
                position={{ lat: evt.location[1], lng: evt.location[0] }}
                label={{ text: iconMap[evt.type] || '📍', fontSize: '16px' }}
              />
            ))}
          </GoogleMap>
        </div>

        <div className="mt-6 space-y-2">
          <p><strong>Distance:</strong> {(distance_meters / 1000).toFixed(1)} kms</p>
          <p><strong>Duration:</strong> {(duration_seconds / 3600).toFixed(2)} hrs</p>
        </div>
      </main>
    </>
  );
}
