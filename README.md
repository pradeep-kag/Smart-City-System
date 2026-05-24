# Smart City System - Industry Level

Welcome to the Smart City System! This project features a modern React (Vite) frontend with a beautiful dark mode UI, and a robust Python Flask backend powered by MongoDB and Machine Learning for traffic prediction.

## Features
- **Role-based Dashboards:** Dedicated views for Admin and User.
- **Traffic Prediction (ML):** Scikit-learn `LinearRegression` predicts traffic volume for the next hour based on historical trends.
- **Real-time Visuals:** Chart.js integration for traffic history.
- **Smart Parking:** Leaflet map integration showing real-time parking zone capacities and availability.
- **Security:** JWT authentication.

---

## 🛠️ Setup Instructions (VS Code)

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB (Running locally on `mongodb://localhost:27017/smartcity`)

### 1. Backend Setup (Flask)
Open a terminal in the root folder and run the following commands:

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Seed the database with mock traffic and parking data
python seed.py

# Run the Flask Server
python app.py
```
*The backend will run on `http://localhost:5000`*

### 2. Frontend Setup (React / Vite)
Open a **new** terminal split in VS Code, and run:

```bash
cd frontend

# Install dependencies (already done if using the provided setup)
npm install

# Start the dev server
npm run dev
```
*The frontend will run on `http://localhost:5173` (or similar).*

---

## 🔐 Demo Credentials

When logging in to the application, you can use the quick-login buttons on the UI, or enter these manually:
- **Admin Role:** Username: `admin` | Password: `password`
- **User Role:** Username: `user` | Password: `password`
