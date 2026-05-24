from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from config import db
from models import User, Admin, Challan, Complaint, Emergency, Parking, Vehicle, SystemLog, Traffic, Environment, Energy, Waste
import datetime
from ml_simulations import simulate_cctv_analysis, simulate_dynamic_traffic_lights, simulate_utility_alerts

admin_bp = Blueprint('admin_bp', __name__)

def is_admin():
    claims = get_jwt()
    return claims.get("role") == "admin"

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    users = User.query.all()
    data = []
    for u in users:
        data.append({
            "_id": str(u.id),
            "username": u.username,
            "name": u.name,
            "email": u.email,
            "mobile": u.mobile,
            "address": u.address,
            "vehicles": [v.plate_number for v in u.vehicles],
            "is_blocked": u.is_blocked
        })
    return jsonify(data), 200

@admin_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    
    total_fines = db.session.query(db.func.sum(Challan.amount)).filter(Challan.status == 'Paid').scalar() or 0
    pending_fines = db.session.query(db.func.sum(Challan.amount)).filter(Challan.status == 'Pending').scalar() or 0
    active_emergencies = Emergency.query.filter_by(status='Active').count()
    
    return jsonify({
        "total_fines_collected": int(total_fines),
        "pending_fines": int(pending_fines),
        "active_emergencies": active_emergencies
    }), 200

@admin_bp.route('/surveillance', methods=['GET'])
@jwt_required()
def get_surveillance():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    cctv = simulate_cctv_analysis()
    traffic = simulate_dynamic_traffic_lights()
    return jsonify({"cctv": cctv, "traffic_lights": traffic}), 200

@admin_bp.route('/utilities', methods=['GET'])
@jwt_required()
def get_utilities():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    utilities = simulate_utility_alerts()
    return jsonify(utilities), 200

@admin_bp.route('/issue-challan', methods=['POST'])
@jwt_required()
def issue_challan():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    data = request.json
    plate = data.get("vehicle")
    
    vehicle_obj = Vehicle.query.filter_by(plate_number=plate).first()
    user_obj = vehicle_obj.owner if vehicle_obj else None
    
    new_challan = Challan(
        user_id=user_obj.id if user_obj else None,
        user_username=user_obj.username if user_obj else "Unknown",
        vehicle=plate,
        violation=data.get("violation"),
        amount=data.get("amount"),
        status="Pending",
        date=datetime.datetime.now().strftime("%Y-%m-%d")
    )
    
    db.session.add(new_challan)
    db.session.commit()
    return jsonify({"msg": "Detailed Challan issued automatically!"}), 201

@admin_bp.route('/emergencies', methods=['GET'])
@jwt_required()
def get_emergencies():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    emergencies = Emergency.query.all()
    data = []
    for e in emergencies:
        data.append({
            "_id": str(e.id),
            "type": e.type,
            "location": e.location,
            "status": e.status,
            "ambulance_dispatched": e.ambulance_dispatched,
            "police_dispatched": e.police_dispatched,
            "fire_dispatched": e.fire_dispatched,
            "has_image": e.has_image
        })
    return jsonify(data), 200

@admin_bp.route('/dispatch-emergency', methods=['POST'])
@jwt_required()
def dispatch_emergency():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    data = request.json
    emer = Emergency.query.get(data.get("id"))
    if not emer: return jsonify({"msg": "Not found"}), 404
    
    # Don't auto-resolve on single dispatch to allow multi-service deployment
    if data.get("dispatch_type") == "ambulance": emer.ambulance_dispatched = True
    elif data.get("dispatch_type") == "police": emer.police_dispatched = True
    elif data.get("dispatch_type") == "fire": emer.fire_dispatched = True
    elif data.get("dispatch_type") == "resolve": emer.status = "Resolved"
        
    db.session.commit()
    return jsonify({"msg": f"Action {data.get('dispatch_type')} processed successfully!"}), 200

@admin_bp.route('/user-history/<username>', methods=['GET'])
@jwt_required()
def get_user_history(username):
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    
    challans = Challan.query.filter_by(user_username=username).all()
    complaints = Complaint.query.filter_by(user_username=username).all()
    
    return jsonify({
        "challans": [{"vehicle": c.vehicle, "violation": c.violation, "amount": c.amount, "status": c.status, "date": c.date} for c in challans],
        "complaints": [{"title": c.title, "dept": c.dept, "status": c.status, "date": c.date} for c in complaints]
    }), 200

@admin_bp.route('/block-user', methods=['POST'])
@jwt_required()
def block_user():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    data = request.json
    user = User.query.filter_by(username=data.get("username")).first()
    if not user: return jsonify({"msg": "User not found"}), 404
    
    user.is_blocked = not user.is_blocked
    db.session.commit()
    
    return jsonify({"msg": f"User {'blocked' if user.is_blocked else 'unblocked'} successfully", "is_blocked": user.is_blocked}), 200

@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_logs():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).all()
    return jsonify([{
        "id": l.id,
        "category": l.category,
        "title": l.title,
        "message": l.message,
        "severity": l.severity,
        "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    } for l in logs]), 200
@admin_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    if not is_admin(): return jsonify({"msg": "Unauthorized"}), 403
    
    # 1. Traffic Data
    traffic_entries = Traffic.query.order_by(Traffic.time.asc()).all()
    traffic_data = [{"time": t.time, "traffic": t.traffic, "accidents": t.accidents} for t in traffic_entries]
    
    # 2. User Count
    user_count = User.query.count()
    
    # 3. Recent Logs
    logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).limit(15).all()
    log_data = [{
        "id": l.id,
        "category": l.category,
        "title": l.title,
        "message": l.message,
        "severity": l.severity,
        "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    } for l in logs]
    
    return jsonify({
        "traffic": traffic_data,
        "user_count": user_count,
        "logs": log_data,
        "active_emergencies": Emergency.query.filter_by(status='Active').count()
    }), 200
