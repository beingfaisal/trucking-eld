// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import TripInfoPage from './pages/tripInfo';
import RouteInfo from './pages/RouteInfo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<TripInfoPage />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
        <Route path="/results" element={<RouteInfo  />} />
      </Routes>
    </BrowserRouter>
  );
}
