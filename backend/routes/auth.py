from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from config import db
from models import User, Admin, Vehicle

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    # Admin login check
    admin = Admin.query.filter_by(username=username).first()
    if admin:
        if not check_password_hash(admin.password_hash, password):
            return jsonify({"msg": "Invalid admin password."}), 401
        access_token = create_access_token(identity=username, additional_claims={"role": "admin"})
        return jsonify(access_token=access_token, role="admin"), 200

    # Normal user login
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"msg": "User not found. Please register first."}), 404
    
    if user.is_blocked:
        return jsonify({"msg": "Your account has been restricted by the city administration."}), 403

    if not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Invalid password."}), 401

    access_token = create_access_token(identity=username, additional_claims={"role": "user"})
    return jsonify(access_token=access_token, role="user"), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    address = data.get('address')
    vehicle_plate = data.get('vehicle')

    if not all([username, password, name, email]):
        return jsonify({"msg": "Missing required fields"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists!"}), 400

    new_user = User(
        username=username,
        password_hash=generate_password_hash(password),
        name=name,
        email=email,
        mobile=mobile,
        address=address
    )
    
    db.session.add(new_user)
    db.session.flush() # Get user id for relationship
    
    if vehicle_plate:
        new_vehicle = Vehicle(plate_number=vehicle_plate, user_id=new_user.id)
        db.session.add(new_vehicle)
    
    db.session.commit()
    return jsonify({"msg": "User registered successfully!"}), 201