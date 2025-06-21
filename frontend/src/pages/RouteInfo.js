/**
 * RouteInfo component renders the trip map, filters, and event details.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useLoadScript,
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import Banner from "../components/Banner";
import { LABELS, ICONS, SECONDS_IN_HOUR, METERS_IN_MILE } from "../constants";

const libraries = ["places"];
const containerStyle = { width: "100%", height: "calc(100vh - 64px)" };

export default function RouteInfo() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const routeData = useMemo(() => location.state?.routeData, [location.state]);
  const rawEvents = useMemo(() => routeData?.events ?? [], [routeData]);

  const events = useMemo(
    () => rawEvents.filter((e) => LABELS.hasOwnProperty(e.type)),
    [rawEvents]
  );

  const types = useMemo(
    () => Array.from(new Set(events.map((e) => e.type))),
    [events]
  );
  const [filters, setFilters] = useState(
    () => types.reduce((acc, t) => ({ ...acc, [t]: true }), {})
  );
  useEffect(() => {
    setFilters(types.reduce((acc, t) => ({ ...acc, [t]: true }), {}));
  }, [types]);

  const [activeEvent, setActiveEvent] = useState(null);
  useEffect(() => {
    if (activeEvent && !filters[activeEvent.type]) {
      setActiveEvent(null);
    }
  }, [filters, activeEvent]);

  useEffect(() => {
    if (!routeData) {
      navigate("/", { replace: true });
    }
  }, [routeData, navigate]);

  if (loadError) {
    return <p className="p-4 text-center">Error loading maps</p>;
  }
  if (!isLoaded) {
    return <p className="p-4 text-center">Loading map…</p>;
  }
  if (!routeData) {
    return null;
  }

  const { path, distance_meters, duration_seconds } = routeData;
  const pathCoords = path.map(([lng, lat]) => ({ lat, lng }));
  const center = pathCoords[Math.floor(pathCoords.length / 2)];

  const onMapLoad = (map) => {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds();
    pathCoords.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds);
  };

  const totalHours = (duration_seconds / SECONDS_IN_HOUR).toFixed(2);
  const totalMiles = (distance_meters / METERS_IN_MILE).toFixed(2);

  return (
    <>
      <Banner/>
      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        <aside className="w-64 shrink-0 overflow-auto bg-gray-50 p-4 space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Trip Summary</h3>
            <p>
              <strong>Distance:</strong> {totalMiles} miles
            </p>
            <p>
              <strong>Duration:</strong> {totalHours} h
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Show / Hide Events</h3>
            {types.map((t) => (
              <label key={t} className="flex items-center text-sm mb-1">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters[t]}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, [t]: !prev[t] }))
                  }
                />
                <span>
                  {ICONS[t]} {LABELS[t]}
                </span>
              </label>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          <GoogleMap
            mapContainerStyle={containerStyle}
            onLoad={onMapLoad}
            center={center}
            zoom={6}
          >
            <Polyline
              path={pathCoords}
              options={{ strokeColor: "#0077FF", strokeWeight: 4 }}
            />

            {events.map(
              (evt, i) =>
                filters[evt.type] && (
                  <Marker
                    key={i}
                    position={{
                      lat: evt.location[1],
                      lng: evt.location[0],
                    }}
                    label={{
                      text: ICONS[evt.type],
                      fontSize: "18px",
                    }}
                    onClick={() => setActiveEvent(evt)}
                  />
                )
            )}

            {activeEvent && (
              <InfoWindow
                position={{
                  lat: activeEvent.location[1],
                  lng: activeEvent.location[0],
                }}
                onCloseClick={() => setActiveEvent(null)}
              >
                <div className="text-sm">
                  <h4 className="font-bold">
                    {LABELS[activeEvent.type]}
                  </h4>
                  {activeEvent.mile_marker != null && (
                    <p>Mile: {activeEvent.mile_marker} mi</p>
                  )}
                  {activeEvent.arrival_time && (
                    <p>
                      Arrival:{" "}
                      {new Date(activeEvent.arrival_time).toLocaleString(
                        "en-GB",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  )}
                  {activeEvent.departure_time && (
                    <p>
                      Departure:{" "}
                      {new Date(activeEvent.departure_time).toLocaleString(
                        "en-GB",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </main>
    </>
  );
}
