import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import Banner from "../components/Banner";
import PlaceAutoCompleteField from "../components/PlaceAutoCompleteField";
import usePlaceAutoComplete from "../hooks/usePlaceAutoComplete";
import api from "../services/api";
import API_ROUTES from "../config/apiRoutes";

const libraries = ["places"];

export default function TripInfoPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const currentHook = usePlaceAutoComplete();
  const pickupHook = usePlaceAutoComplete();
  const dropoffHook = usePlaceAutoComplete();
  const allValid = currentHook.isValid && pickupHook.isValid && dropoffHook.isValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid || isCalculating) return;

    setIsCalculating(true);
    const payload = {
      date,
      currentLocation: {
        address: currentHook.address,
        lat: currentHook.lat,
        lng: currentHook.lng,
        type: "start",
      },
      pickupLocation: {
        address: pickupHook.address,
        lat: pickupHook.lat,
        lng: pickupHook.lng,
        type: "pickup",
      },
      dropoffLocation: {
        address: dropoffHook.address,
        lat: dropoffHook.lat,
        lng: dropoffHook.lng,
        type: "dropoff",
      },
    };

    try {
      const { data } = await api.post(API_ROUTES.navigation.route, payload);
      navigate("/results", { state: { routeData: data, inputData: payload } });
    } catch {
      // eslint-disable-next-line no-alert
      alert("Could not calculate route. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  if (loadError) {
    return <p className="p-4 text-center text-red-600">Error loading maps</p>;
  }
  if (!isLoaded) {
    return <p className="p-4 text-center">Loading map…</p>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Banner />

      <main className="flex-1 flex items-start justify-center pt-32">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Trip Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="trip-date"
                  className="block text-base font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  id="trip-date"
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:ring-blue-500 focus:border-blue-500 transition"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <PlaceAutoCompleteField
                label="Current Location"
                hook={currentHook}
                placeholder="Start typing an address…"
              />
              <PlaceAutoCompleteField
                label="Pickup Location"
                hook={pickupHook}
                placeholder="Start typing an address…"
              />
              <PlaceAutoCompleteField
                label="Drop-off Location"
                hook={dropoffHook}
                placeholder="Start typing an address…"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!allValid || isCalculating}
                className={`px-8 py-2 rounded-md text-white font-medium text-base transition
                  ${
                    allValid && !isCalculating
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {isCalculating ? "Calculating..." : "Calculate Route"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
