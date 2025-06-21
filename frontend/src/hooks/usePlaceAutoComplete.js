import { useState, useRef } from 'react';

export default function usePlaceAutoComplete(initialAddress = '') {
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const ref = useRef(null);

  const handlePlaceChanged = () => {
    const place = ref.current.getPlace?.();
    if (place?.formatted_address && place.geometry) {
      setAddress(place.formatted_address);
      setLat(place.geometry.location.lat());
      setLng(place.geometry.location.lng());
      setIsValid(true);
      setTouched(true);
    }
  };

  const handleChange = e => {
    setAddress(e.target.value);
    setIsValid(false);
    setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return {
    address,
    lat,
    lng,
    touched,
    isValid,
    ref,
    handlePlaceChanged,
    handleChange,
    handleBlur,
  };
}
