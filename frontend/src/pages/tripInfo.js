import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoadScript } from '@react-google-maps/api';
import PlaceAutoCompleteField from '../components/PlaceAutoCompleteField';
import usePlaceAutoComplete from '../hooks/usePlaceAutoComplete';
import Banner from '../components/Banner';
import api from '../services/api';
import API_ROUTES from '../config/apiRoutes';

const libraries = ['places'];

export default function TripInfoPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const navigate = useNavigate();

  const [date, setDate] = useState('');
  
  const currentHook  = usePlaceAutoComplete();
  const pickupHook   = usePlaceAutoComplete();
  const dropoffHook  = usePlaceAutoComplete();
  
  const allValidAddress = currentHook.isValid && pickupHook.isValid && dropoffHook.isValid;


  if (loadError) return <p className="p-4 text-center">Error loading Maps</p>;
  if (!isLoaded)  return <p className="p-4 text-center">Loading map…</p>;

  // Submit handler
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!allValidAddress) return;
    const payload = {
      date,
      currentLocation: {address: currentHook.address, lat: currentHook.lat, lng: currentHook.lng, type: 'start' },
      pickupLocation: {address: pickupHook.address, lat: pickupHook.lat, lng: pickupHook.lng, type: 'pickup' },
      dropoffLocation: {address: dropoffHook.address, lat: dropoffHook.lat, lng: dropoffHook.lng, type: 'dropoff' },
    };
    
    try {
      const res = await api.post(API_ROUTES.navigation.route, payload);
      navigate('/results', {
        state: {
          routeData: res.data,
          inputData: payload,
        }
      });
    } catch (err) {
      console.error(err);
      alert('Could not calculate route. Please try again.');
    }
  };

  return (
    <>
      <Banner />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Trip Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Row 1: Date & Driver Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={date}
                  onChange={e => setDate(e.target.value)}
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

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
            >
              Calculate Route
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
