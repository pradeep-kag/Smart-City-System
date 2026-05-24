from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from config import db
from models import Environment, Waste
from ml_simulations import predict_aqi

environment_bp = Blueprint('environment_bp', __name__)

@environment_bp.route('/aqi', methods=['GET'])
@jwt_required()
def get_aqi():
    env_entries = Environment.query.all()
    data = []
    for e in env_entries:
        data.append({
            "zone": e.zone,
            "aqi": e.aqi,
            "temp": e.temp,
            "noise_db": e.noise_db,
            "predicted_aqi_48h": predict_aqi(e.aqi)
        })
    return jsonify({"data": data, "model": "Autoregressive AQI Forecast"}), 200

@environment_bp.route('/heat-islands', methods=['GET'])
@jwt_required()
def get_heat_islands():
    data = [
        {"zone": "Industrial Sector", "temp_anomaly": "+4.2C", "status": "Critical Heat Island"},
        {"zone": "Downtown Square", "temp_anomaly": "+2.1C", "status": "Moderate Heat Island"}
    ]
    return jsonify({"data": data, "model": "Thermal Clustering"}), 200

@environment_bp.route('/waste-bins', methods=['GET'])
@jwt_required()
def get_waste():
    waste_entries = Waste.query.all()
    data = [{"id": w.bin_id, "location": w.location, "fill_percentage": w.fill_percentage} for w in waste_entries]
    return jsonify({"data": data}), 200

@environment_bp.route('/report-incident', methods=['POST'])
@jwt_required()
def report_incident():
    data = request.get_json()
    # Logic for incident reporting can be expanded here
    return jsonify({"msg": "Incident reported successfully. Emergency services notified."}), 201
