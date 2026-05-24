import numpy as np
from sklearn.linear_model import LinearRegression
from config import db
import datetime

def predict_traffic():
    """
    Predicts traffic volume using Linear Regression based on historical data.
    In a real scenario, this would include weather, events, etc.
    """
    data = list(db.traffic.find({}, {"_id": 0}))

    if len(data) < 5:
        return {"prediction": "Not enough data for ML prediction"}

    # Features: Hour of the day (0-23)
    X = np.array([d["time"] for d in data]).reshape(-1, 1)
    
    # Target: Traffic Volume
    y = np.array([d["traffic"] for d in data])

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict for the NEXT hour based on current time
    current_hour = datetime.datetime.now().hour
    next_hour = (current_hour + 1) % 24
    
    future_time = np.array([[next_hour]])
    prediction = model.predict(future_time)[0]

    return {
        "prediction": int(prediction),
        "target_hour": next_hour
    }