import React, { useState, useRef } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import Banner from '../components/Banner';

const libraries = ['places'];

export default function TripInfoPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Form state
  const [date, setDate] = useState('');
  const [driverNumber, setDriverNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [homeCenter, setHomeCenter] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [trailerNumbers, setTrailerNumbers] = useState(['']);
  const [shipperName, setShipperName] = useState('');
  const [commodityName, setCommodityName] = useState('');
  const [loadNumbers, setLoadNumbers] = useState(['']);

  // Address state
  const [current, setCurrent] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  // Autocomplete refs
  const currentRef = useRef(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  if (loadError) return <p className="p-4 text-center">Error loading Maps</p>;
  if (!isLoaded)  return <p className="p-4 text-center">Loading map…</p>;

  // Utility: add or update dynamic fields
  const addField = (setter, arr) => () => setter([...arr, '']);
  const updateField = (idx, value, arr, setter) => {
    const tmp = [...arr];
    tmp[idx] = value;
    setter(tmp);
  };

  // Handle place select
  const handlePlaceChanged = (ref, setter) => {
    const place = ref.current.getPlace();
    if (place && place.formatted_address) {
      setter(place.formatted_address);
    }
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      date,
      driverNumber,
      driverName,
      homeOperatingCenter: homeCenter,
      truckNumber,
      trailerNumbers: trailerNumbers.filter(Boolean),
      shipperName,
      commodityName,
      loadNumbers: loadNumbers.filter(Boolean),
      currentLocation: current,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
    };
    console.log('Payload', payload);
    // TODO: send to backend via api.post
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
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Location</label>
                    <Autocomplete
                      onLoad={auto => (currentRef.current = auto)}
                      onPlaceChanged={() => handlePlaceChanged(currentRef, setCurrent)}
                    >
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2"
                        placeholder="Start typing an address…"
                        value={current}
                        onChange={e => setCurrent(e.target.value)}
                        required
                      />
                    </Autocomplete>
                </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pickup Location</label>
                    <Autocomplete
                      onLoad={auto => (pickupRef.current = auto)}
                      onPlaceChanged={() => handlePlaceChanged(pickupRef, setPickup)}
                    >
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2"
                        placeholder="Start typing an address…"
                        value={pickup}
                        onChange={e => setPickup(e.target.value)}
                        required
                      />
                    </Autocomplete>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Drop-off Location</label>
                    <Autocomplete
                      onLoad={auto => (dropoffRef.current = auto)}
                      onPlaceChanged={() => handlePlaceChanged(dropoffRef, setDropoff)}
                    >
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2"
                        placeholder="Start typing an address…"
                        value={dropoff}
                        onChange={e => setDropoff(e.target.value)}
                        required
                      />
                    </Autocomplete>
                  </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Number (7 digits)</label>
                <input
                  type="text"
                  maxLength={7}
                  className="w-full border rounded-lg p-2"
                  value={driverNumber}
                  onChange={e => setDriverNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Driver Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  required
                />
              </div>

            <div>
              <label className="block text-sm font-medium mb-1">Home Operating Center</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={homeCenter}
                onChange={e => setHomeCenter(e.target.value)}
                required
              />
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Truck Number</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={truckNumber}
                  onChange={e => setTruckNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipper Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={shipperName}
                  onChange={e => setShipperName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Commodity Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={commodityName}
                  onChange={e => setCommodityName(e.target.value)}
                  required
                />
              </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trailer Number(s)</label>
              <div className="space-y-2">
                {trailerNumbers.map((val, i) => (
                  <input
                    key={i}
                    type="text"
                    className="w-full border rounded-lg p-2"
                    placeholder="Trailer Number"
                    value={val}
                    onChange={e => updateField(i, e.target.value, trailerNumbers, setTrailerNumbers)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm mt-1"
                onClick={addField(setTrailerNumbers, trailerNumbers)}
              >
                + Add Trailer
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Load Number(s)</label>
              <div className="space-y-2">
                {loadNumbers.map((val, i) => (
                  <input
                    key={i}
                    type="text"
                    className="w-full border rounded-lg p-2"
                    placeholder="Load Number"
                    value={val}
                    onChange={e => updateField(i, e.target.value, loadNumbers, setLoadNumbers)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm mt-1"
                onClick={addField(setLoadNumbers, loadNumbers)}
              >
                + Add Load
              </button>
            </div>
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
