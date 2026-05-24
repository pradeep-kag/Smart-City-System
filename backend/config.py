import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

# Dual-Mode SQL Configuration
# Defaults to SQLite for immediate "out-of-the-box" operation, 
# but ready for PostgreSQL when the DATABASE_URL is provided in .env
SQL_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///smartcity.db")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
GROQ_API_KEY = os.getenv("VITE_GROQ_API_KEY")

db = SQLAlchemy()