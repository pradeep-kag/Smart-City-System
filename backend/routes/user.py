from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from models import User, Challan, Complaint, Emergency, Parking
from ml_simulations import simulate_nlp_chatbot, simulate_smart_routing
import datetime

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    data = request.json
    message = data.get("message", "")
    response = simulate_nlp_chatbot(message)
    return jsonify({"response": response}), 200

@user_bp.route('/route-optimizer', methods=['POST'])
@jwt_required()
def route_optimizer():
    data = request.json
    destination = data.get("destination", "City Center")
    routes = simulate_smart_routing(destination)
    return jsonify(routes), 200

@user_bp.route('/challans', methods=['GET'])
@jwt_required()
def get_challans():
    user_id_identity = get_jwt_identity()
    user = User.query.filter_by(username=user_id_identity).first()
    if not user: return jsonify([]), 200
    
    challans = Challan.query.filter_by(user_id=user.id).all()
    data = []
    for c in challans:
        data.append({
            "_id": str(c.id),
            "vehicle": c.vehicle,
            "violation": c.violation,
            "amount": c.amount,
            "status": c.status,
            "date": c.date,
            "address": "Auto-detected Location" # Mock
        })
    return jsonify(data), 200

@user_bp.route('/pay-challan', methods=['POST'])
@jwt_required()
def pay_challan():
    challan_id = request.json.get("id")
    challan = Challan.query.get(challan_id)
    if challan:
        challan.status = "Paid"
        db.session.commit()
    return jsonify({"msg": "Challan paid successfully via Payment Gateway"}), 200

@user_bp.route('/book-parking', methods=['POST'])
@jwt_required()
def book_parking():
    zone_name = request.json.get("zone")
    parking = Parking.query.filter_by(name=zone_name).first()
    if parking and parking.occupied < parking.capacity:
        parking.occupied += 1
        db.session.commit()
    return jsonify({"msg": f"Spot booked at {zone_name}"}), 200

@user_bp.route('/report-emergency', methods=['POST'])
@jwt_required()
def report_emergency():
    user_identity = get_jwt_identity()
    user = User.query.filter_by(username=user_identity).first()
    data = request.json
    emer_type = data.get("type", "Accident")
    
    ambulance = False
    police = False
    fire = False
    
    if "Fight" in emer_type or "Riot" in emer_type: police = True
    elif "Major Accident" in emer_type: ambulance, police = True, True
    elif "Fire" in emer_type: fire, police = True, True
    else: ambulance = True

    has_image = bool(data.get("image"))

    new_emergency = Emergency(
        type=emer_type,
        location=data.get("location"),
        status="Active",
        ambulance_dispatched=ambulance,
        police_dispatched=police,
        fire_dispatched=fire,
        has_image=has_image
    )
    
    db.session.add(new_emergency)
    db.session.commit()
    
    return jsonify({
        "msg": "Emergency/Complaint reported.",
        "auto_action": {"ambulance": ambulance, "police": police, "fire": fire}
    }), 201

@user_bp.route('/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    user_identity = get_jwt_identity()
    user = User.query.filter_by(username=user_identity).first()
    if not user: return jsonify([]), 200
    
    complaints = Complaint.query.filter_by(user_id=user.id).all()
    return jsonify([{
        "id": c.id,
        "title": c.title,
        "dept": c.dept,
        "status": c.status,
        "date": c.date,
        "description": c.description
    } for c in complaints]), 200

@user_bp.route('/file-complaint', methods=['POST'])
@jwt_required()
def file_complaint():
    user_identity = get_jwt_identity()
    user = User.query.filter_by(username=user_identity).first()
    data = request.json
    
    new_complaint = Complaint(
        user_id=user.id,
        user_username=user.username,
        title=data.get("title"),
        dept=data.get("dept", "Assigned via AI"),
        description=data.get("description", ""),
        status="Pending",
        date=datetime.datetime.now().strftime("%Y-%m-%d")
    )
    
    db.session.add(new_complaint)
    db.session.commit()
    return jsonify({"msg": "Grievance filed successfully"}), 201
