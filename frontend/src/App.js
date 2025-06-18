// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import TripInfoPage from './pages/tripInfo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/"      element={<TripInfoPage />} />
        {/* Second page: show the calculated route */}
        {/* <Route path="/route" element={<RoutePage />} /> */}
        {/* Fallback */}
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
