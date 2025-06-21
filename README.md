# Trucking ELD

**Effortless Route Planning for Drivers**

A simple web application that calculates driving routes, schedules mandatory stops (fuel, breaks, rest), and displays everything on an interactive map to help drivers stay compliant and efficient.

## Features

* **Route Calculation:** Uses OSRM to compute optimal paths between waypoints.
* **Automated Stops:** Schedules fuel stops, 30‑min breaks, and off‑duty/rest periods based on driving rules.
* **Interactive Map:** Visualize the route and events with Google Maps.
* **Toggle Events:** Show/hide different event types for clarity.

## Getting Started

### Backend

1. Navigate to the `backend/` directory.
2. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate    # Windows: venv\\Scripts\\activate
   ```
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start the server:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend

1. Navigate to the `frontend/` directory.
2. Install npm packages:

   ```bash
   npm install
   ```
3. Create a `.env.local` file with:

   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```
4. Start the development server:

   ```bash
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.
