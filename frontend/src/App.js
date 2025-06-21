// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import TripInfo from './pages/TripInfo';
import RouteInfo from './pages/RouteInfo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TripInfo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/results" element={<RouteInfo  />} />
      </Routes>
    </BrowserRouter>
  );
}
