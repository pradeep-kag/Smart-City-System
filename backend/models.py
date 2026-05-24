from config import db
from datetime import datetime

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='admin')

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    mobile = db.Column(db.String(15))
    address = db.Column(db.Text)
    is_blocked = db.Column(db.Boolean, default=False)
    vehicles = db.relationship('Vehicle', backref='owner', lazy=True)
    challans = db.relationship('Challan', backref='user_rel', lazy=True)
    complaints = db.relationship('Complaint', backref='user_rel', lazy=True)

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

class Challan(db.Model):
    __tablename__ = 'challans'
    id = db.Column(db.Integer, primary_key=True)
    user_username = db.Column(db.String(50)) # For backward compatibility in logic
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    vehicle = db.Column(db.String(20))
    violation = db.Column(db.String(255))
    amount = db.Column(db.Integer)
    status = db.Column(db.String(20), default='Pending')
    date = db.Column(db.String(20), default=datetime.now().strftime("%Y-%m-%d"))

class Complaint(db.Model):
    __tablename__ = 'complaints'
    id = db.Column(db.Integer, primary_key=True)
    user_username = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(255))
    dept = db.Column(db.String(50))
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='Open')
    date = db.Column(db.String(20), default=datetime.now().strftime("%Y-%m-%d"))

class Emergency(db.Model):
    __tablename__ = 'emergencies'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
    location = db.Column(db.String(255))
    status = db.Column(db.String(20), default='Active')
    ambulance_dispatched = db.Column(db.Boolean, default=False)
    police_dispatched = db.Column(db.Boolean, default=False)
    fire_dispatched = db.Column(db.Boolean, default=False)
    has_image = db.Column(db.Boolean, default=False)

class Parking(db.Model):
    __tablename__ = 'parking'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    capacity = db.Column(db.Integer)
    occupied = db.Column(db.Integer)

class Traffic(db.Model):
    __tablename__ = 'traffic'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    traffic = db.Column(db.Integer)
    accidents = db.Column(db.Integer)

class Environment(db.Model):
    __tablename__ = 'environment'
    id = db.Column(db.Integer, primary_key=True)
    zone = db.Column(db.String(50))
    aqi = db.Column(db.Integer)
    temp = db.Column(db.Integer)
    noise_db = db.Column(db.Integer)

class Energy(db.Model):
    __tablename__ = 'energy'
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    power_load_mw = db.Column(db.Integer)
    solar_efficiency = db.Column(db.Integer)

class Waste(db.Model):
    __tablename__ = 'waste'
    id = db.Column(db.Integer, primary_key=True)
    bin_id = db.Column(db.String(20))
    location = db.Column(db.String(100))
    fill_percentage = db.Column(db.Integer)

class SystemLog(db.Model):
    __tablename__ = 'system_logs'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50)) # Emergency, Utility, Security, Traffic
    title = db.Column(db.String(100))
    message = db.Column(db.Text)
    severity = db.Column(db.String(20)) # High, Medium, Low
    timestamp = db.Column(db.DateTime, default=datetime.now)
