from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from config import db
from prediction import predict_traffic

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/traffic-history', methods=['GET'])
@jwt_required()
def get_traffic_history():
    try:
        # Fetch ordered by time
        data = list(db.traffic.find({}, {"_id": 0}).sort("time", 1))
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route('/predict-traffic', methods=['GET'])
@jwt_required()
def get_traffic_prediction():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"msg": "Admin access required"}), 403

    try:
        prediction = predict_traffic()
        return jsonify(prediction), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route('/parking', methods=['GET'])
@jwt_required()
def get_parking():
    try:
        # Fetch all parking spots
        data = list(db.parking.find({}, {"_id": 0}))
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
