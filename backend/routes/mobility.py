from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import db
from models import Traffic, Parking
from ml_simulations import predict_traffic, predict_accident_hotspots
import datetime

mobility_bp = Blueprint('mobility_bp', __name__)

@mobility_bp.route('/traffic', methods=['GET'])
@jwt_required()
def get_traffic():
    traffic_entries = Traffic.query.order_by(Traffic.time.asc()).all()
    data = [{"time": t.time, "traffic": t.traffic, "accidents": t.accidents} for t in traffic_entries]
    return jsonify({"data": data}), 200

@mobility_bp.route('/predict-traffic', methods=['GET'])
@jwt_required()
def predict_traffic_route():
    current_hour = datetime.datetime.now().hour
    prediction = predict_traffic(current_hour)
    return jsonify({"prediction": int(prediction), "model": "LinearRegression (Trained)"}), 200

@mobility_bp.route('/accidents', methods=['GET'])
@jwt_required()
def get_accidents():
    hotspots = predict_accident_hotspots()
    return jsonify({"data": hotspots, "model": "Probabilistic Risk Model"}), 200

@mobility_bp.route('/parking', methods=['GET'])
@jwt_required()
def get_parking():
    parking_entries = Parking.query.all()
    data = [{
        "name": p.name, 
        "lat": p.lat, 
        "lng": p.lng, 
        "capacity": p.capacity, 
        "occupied": p.occupied
    } for p in parking_entries]
    return jsonify({"data": data}), 200
