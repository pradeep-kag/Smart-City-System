from app import app
from models import SystemLog, db

with app.app_context():
    try:
        logs = SystemLog.query.all()
        print(f"Found {len(logs)} logs.")
        for l in logs:
            print(f"[{l.severity}] {l.title}")
    except Exception as e:
        print(f"ERROR: {e}")
