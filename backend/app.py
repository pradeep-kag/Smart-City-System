from flask import Flask, jsonify
from flask_cors import CORS
from config import JWT_SECRET_KEY, db, SQL_DATABASE_URI
from flask_jwt_extended import JWTManager
import os

# Blueprints
from routes.auth import auth_bp
from routes.mobility import mobility_bp
from routes.energy import energy_bp
from routes.environment import environment_bp
from routes.admin import admin_bp
from routes.user import user_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True, headers=['Content-Type', 'Authorization'])

# DB Config
app.config["SQLALCHEMY_DATABASE_URI"] = SQL_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# JWT Config
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(mobility_bp, url_prefix="/api/mobility")
app.register_blueprint(energy_bp, url_prefix="/api/energy")
app.register_blueprint(environment_bp, url_prefix="/api/environment")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(user_bp, url_prefix="/api/user")

# Create tables within app context
with app.app_context():
    db.create_all()

@app.route("/")
def home():
    db_type = "PostgreSQL" if "postgresql" in SQL_DATABASE_URI else "SQLite"
    return {"message": f"Smart City Backend API V3 ({db_type}) Running"}

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)