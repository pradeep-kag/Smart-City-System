from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config import db
from models import Energy
from ml_simulations import predict_power_load, detect_anomaly

energy_bp = Blueprint('energy_bp', __name__)

@energy_bp.route('/power-load', methods=['GET'])
@jwt_required()
def get_power_load():
    energy_entries = Energy.query.order_by(Energy.time.asc()).all()
    data = [{"time": e.time, "power_load_mw": e.power_load_mw, "solar_efficiency": e.solar_efficiency} for e in energy_entries]
    return jsonify({"data": data}), 200

@energy_bp.route('/forecast-load', methods=['GET'])
@jwt_required()
def forecast_load():
    forecast = predict_power_load()
    return jsonify({"data": forecast, "model": "Sinusoidal Load Model (Trained)"}), 200

@energy_bp.route('/water-leaks', methods=['GET'])
@jwt_required()
def get_water_leaks():
    leaks = [
        {"pipeline_id": "P-104", "status": detect_anomaly(10, 5.5)},
        {"pipeline_id": "P-105", "status": detect_anomaly(40, 7.1)}
    ]
    return jsonify({"data": leaks, "model": "IsolationForest (Trained)"}), 200
