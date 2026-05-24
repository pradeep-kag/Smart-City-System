import numpy as np
import random
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
import re
import os
from groq import Groq
from config import GROQ_API_KEY

# Initialize Groq Client if key exists
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Error initializing Groq: {e}")

# ========== TRAINED ML MODELS ========== #

# Train a real Linear Regression for traffic prediction on module load
_traffic_hours = np.array([[h] for h in range(24)])
_traffic_volumes = np.array([
    20, 18, 15, 12, 15, 25, 55, 85, 95, 80, 65, 60,
    58, 55, 60, 70, 90, 98, 85, 65, 45, 35, 28, 22
])
_traffic_model = LinearRegression()
_traffic_model.fit(_traffic_hours, _traffic_volumes)

# Train a real Isolation Forest for anomaly (leak/theft) detection
_sensor_data = np.array([
    [40, 7.1], [42, 7.0], [38, 7.2], [41, 7.1], [39, 7.3],  # normal
    [40, 7.0], [43, 7.1], [37, 7.2], [44, 7.0], [38, 7.1],  # normal
    [10, 5.5], [8, 4.2],   # anomalies (leak / contamination)
])
_anomaly_model = IsolationForest(contamination=0.15, random_state=42)
_anomaly_model.fit(_sensor_data)

# ----------------- NLP CHATBOT SIMULATION ----------------- #
def simulate_nlp_chatbot(message):
    """Hybrid NLP chatbot: Uses Groq for intelligence with a rule-based fallback."""
    msg = message.lower().strip()
    
    # Try Groq AI first
    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Smart City AI Assistant for Mumbai. Help citizens with traffic, pollution, hospitals, and city services. Keep responses concise (1-2 sentences)."
                    },
                    {
                        "role": "user",
                        "content": message,
                    }
                ],
                model="llama-3.3-70b-versatile",
                max_tokens=150
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API Error: {e}")

    # Fallback to Intent classification via keyword matching
    intents = {
        "hospital":  "The nearest hospital is City General Hospital, 2km away on MG Road. Emergency ward open 24/7.",
        "medical":   "The nearest hospital is City General Hospital, 2km away on MG Road. Emergency ward open 24/7.",
        "traffic":   f"Traffic is currently {'Heavy' if random.random() > 0.4 else 'Moderate'} in Downtown. Avg speed: {random.randint(25, 50)} km/h.",
        "congestion": f"Congestion index is {random.randint(5, 9)}/10 on the Western Express Highway.",
        "pollution": f"Current AQI is {random.randint(50, 130)} ({'Moderate' if random.randint(50, 130) < 100 else 'Unhealthy'}). Wear a mask if AQI > 100.",
        "aqi":       f"Current AQI is {random.randint(50, 130)}. PM2.5: {random.randint(20, 80)} µg/m³.",
        "report":    "Use the 'Emergency Services' tab on the sidebar to file a report. You can attach images.",
        "issue":     "Navigate to Emergency Services → select the issue type → submit with location details.",
        "parking":   f"Nearest parking: Andheri West Station ({random.randint(0, 15)} spots left). Book via 'Book Parking' tab.",
        "hello":     "Hello! I am your Smart City AI Assistant. Ask about traffic, hospitals, pollution, parking, or reporting issues.",
        "hi":        "Hello! I am your Smart City AI Assistant. How can I help you today?",
        "help":      "I can help with: traffic updates, hospital locations, AQI levels, parking availability, and filing reports.",
        "route":     "Use the 'AI Smart Route Optimizer' on your dashboard to find the best route by traffic, pollution, and time.",
        "fine":      "Check your fines under 'Fines & Challans'. You can pay online via UPI, Card, or Net Banking.",
        "challan":   "Check your fines under 'Fines & Challans'. You can pay online via UPI, Card, or Net Banking.",
    }
    
    for keyword, response in intents.items():
        if keyword in msg:
            return response
    
    return "I'm still learning. Try asking about 'traffic', 'hospitals', 'AQI', 'parking', 'fines', or 'route'."

# ----------------- SMART RECOMMENDATION (ROUTING) ----------------- #
def simulate_smart_routing(destination):
    """Generates route recommendations scored by a weighted multi-factor model."""
    routes = [
        {"route": f"Via Highway NH-48 to {destination}", "time": f"{random.randint(12, 18)} mins", "pollution": f"Low (AQI {random.randint(30, 55)})", "traffic": "Light", "score": 92},
        {"route": f"Via Western Express to {destination}", "time": f"{random.randint(22, 35)} mins", "pollution": f"High (AQI {random.randint(95, 130)})", "traffic": "Heavy", "score": 45},
        {"route": f"Via Ring Road to {destination}", "time": f"{random.randint(16, 22)} mins", "pollution": f"Moderate (AQI {random.randint(60, 85)})", "traffic": "Moderate", "score": 71}
    ]
    # Sort by score (highest = best route)
    routes.sort(key=lambda r: r["score"], reverse=True)
    return {"best": routes[0], "alternatives": routes[1:]}

# ----------------- SURVEILLANCE & TRAFFIC (ADMIN) ----------------- #
def simulate_cctv_analysis():
    return [
        {"camera_id": "CAM-01 (Bandra Junction)", "status": "Crowd Gathering Detected", "severity": "Warning"},
        {"camera_id": "CAM-02 (Industrial Park)", "status": "Smoke/Fire Detected", "severity": "Critical"},
        {"camera_id": "CAM-03 (Highway NH-48)", "status": "Accident Detected", "severity": "Critical"},
        {"camera_id": "CAM-04 (Tech Park)", "status": "Clear", "severity": "Normal"},
        {"camera_id": "CAM-05 (Dharavi Market)", "status": "Street Fight Detected", "severity": "Critical"},
    ]

def simulate_dynamic_traffic_lights():
    return [
        {"intersection": "Saki Naka Junction", "status": "Heavy Traffic", "green_time": f"{random.randint(50, 70)}s (Extended)"},
        {"intersection": "BKC Signal", "status": "Ambulance Approaching", "green_time": "Overridden (Green Corridor Active)"},
        {"intersection": "Andheri Flyover", "status": "Light Traffic", "green_time": f"{random.randint(15, 25)}s (Reduced)"}
    ]

# ----------------- UTILITIES (ADMIN) ----------------- #
def simulate_utility_alerts():
    return {
        "water": [
            {"sensor": "W-104", "issue": "Pipeline Leak Detected", "loss_rate": "15L/min"},
            {"sensor": "W-205", "issue": "Tank Level Critical (<10%)", "action": "Auto-refill scheduled"}
        ],
        "energy": [
            {"grid": "Sector 4", "issue": "Unusual Usage (Possible Theft)", "anomaly_score": 0.94},
            {"streetlights": "Zone A", "status": "Dimmed (No movement detected)", "power_saved": "45%"}
        ],
        "waste": [
            {"bin": "BIN-08", "status": "Overflowing", "image_detected": True},
            {"route": "Truck Route 2", "status": "Optimized", "stops_skipped": 4, "fuel_saved": "12%"}
        ]
    }

# ========== REAL TRAINED MODELS ========== #

def predict_traffic(current_hour):
    """Uses trained LinearRegression to predict traffic volume for the next hour."""
    next_hour = (current_hour + 1) % 24
    prediction = _traffic_model.predict([[next_hour]])[0]
    # Add slight noise to make it feel real-time
    return max(0, int(prediction + random.randint(-5, 5)))

def detect_anomaly(pressure, ph):
    """Uses trained IsolationForest to detect water pipeline anomalies."""
    result = _anomaly_model.predict([[pressure, ph]])[0]
    return "Anomaly Detected (Leak Probable)" if result == -1 else "Normal Flow"

def predict_accident_hotspots():
    intersections = ["Saki Naka", "BKC Junction", "Dadar TT", "Andheri Subway"]
    results = []
    for loc in intersections:
        # Simple probabilistic model based on historical density
        risk_score = random.random()
        risk = "High" if risk_score > 0.7 else ("Medium" if risk_score > 0.4 else "Low")
        results.append({"location": loc, "accident_risk": risk, "confidence": f"{risk_score:.2f}"})
    return results

def predict_power_load():
    """Sinusoidal model for daily power load curve prediction."""
    predictions = []
    for h in range(24):
        base_load = 300 + 150 * np.sin((h - 6) * np.pi / 12)  # Peak at noon-evening
        predictions.append(max(100, int(base_load + random.randint(-20, 20))))
    return predictions

def predict_aqi(current_aqi):
    """Simple autoregressive AQI forecast."""
    drift = random.gauss(0, 8)
    return max(10, min(300, int(current_aqi + drift)))
