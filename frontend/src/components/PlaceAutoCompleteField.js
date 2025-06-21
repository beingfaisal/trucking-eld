import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from '@react-google-maps/api';

function PlaceAutoCompleteField({ label, hook, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Autocomplete
        onLoad={(auto) => {
          hook.ref.current = auto;
        }}
        onPlaceChanged={hook.handlePlaceChanged}
      >
        <input
          type="text"
          className={`w-full rounded-lg p-2 border ${
            hook.touched && !hook.isValid
              ? 'border-red-500'
              : 'border-gray-300'
          }`}
          placeholder={placeholder}
          value={hook.address}
          onChange={hook.handleChange}
          onBlur={hook.handleBlur}
        />
      </Autocomplete>
      {hook.touched && !hook.isValid && (
        <p className="text-red-500 text-sm mt-1">
          Please select an address from the suggestions.
        </p>
      )}
    </div>
  );
}

PlaceAutoCompleteField.propTypes = {
  label: PropTypes.string.isRequired,
  hook: PropTypes.shape({
    ref: PropTypes.shape({ current: PropTypes.object }),
    handlePlaceChanged: PropTypes.func.isRequired,
    touched: PropTypes.bool,
    isValid: PropTypes.bool,
    address: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
  }).isRequired,
  placeholder: PropTypes.string,
};

PlaceAutoCompleteField.defaultProps = {
  placeholder: '',
};

export default PlaceAutoCompleteField;
