import os
import random
from config import db
from app import app
from models import Admin, User, Vehicle, Traffic, Parking, Environment, Energy, Waste, Challan, Emergency, Complaint
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def seed_database():
    with app.app_context():
        print("--- Deep Seeding Professional Smart City Database (PostgreSQL/SQLite) ---")
        db.drop_all()
        db.create_all()

        # 1. Admin Accounts
        print("[1/9] Seeding Administration Accounts...")
        admins = [
            Admin(username="admin", password_hash=generate_password_hash("admin123"), role="admin"),
            Admin(username="superadmin", password_hash=generate_password_hash("super123"), role="admin"),
            Admin(username="operator1", password_hash=generate_password_hash("op123"), role="admin"),
            Admin(username="security_head", password_hash=generate_password_hash("sec123"), role="admin")
        ]
        db.session.add_all(admins)
        
        # 2. Traffic Vitals (24-hour cycle)
        print("[2/9] Seeding 24-Hour Traffic Density...")
        for hour in range(24):
            volume = 85 + random.randint(0, 15) if (7 <= hour <= 9 or 17 <= hour <= 19) else random.randint(20, 50)
            t = Traffic(time=hour, traffic=volume, accidents=random.randint(0, 3) if volume > 80 else 0)
            db.session.add(t)

        # 3. Smart Parking Grid (Mumbai Zones)
        print("[3/9] Seeding Infrastructure: Parking...")
        parking_zones = [
            {"name": "Andheri West Station", "lat": 19.1197, "lng": 72.8464, "capacity": 150, "occupied": 145},
            {"name": "Bandra Kurla Complex (BKC)", "lat": 19.0658, "lng": 72.8653, "capacity": 600, "occupied": 520},
            {"name": "Marine Drive North", "lat": 18.9438, "lng": 72.8225, "capacity": 100, "occupied": 98},
            {"name": "Colaba Market Hub", "lat": 18.9189, "lng": 72.8122, "capacity": 120, "occupied": 40},
            {"name": "Dadar Central Plaza", "lat": 19.0178, "lng": 72.8438, "capacity": 250, "occupied": 245},
            {"name": "Worli Sea Link Entrance", "lat": 19.0222, "lng": 72.8150, "capacity": 180, "occupied": 30},
            {"name": "Lower Parel Galleria", "lat": 18.9926, "lng": 72.8297, "capacity": 400, "occupied": 380},
            {"name": "Juhu Beach North", "lat": 19.1027, "lng": 72.8264, "capacity": 200, "occupied": 190},
            {"name": "Vashi Sector 17", "lat": 19.0760, "lng": 72.9991, "capacity": 300, "occupied": 150},
        ]
        for p in parking_zones:
            db.session.add(Parking(**p))

        # 4. Environmental Monitoring
        print("[4/9] Seeding Environmental Sensors...")
        env_zones = [
            {"zone": "Downtown (Business)", "aqi": 165, "temp": 30, "noise_db": 85},
            {"zone": "Suburban Green Belt", "aqi": 42, "temp": 25, "noise_db": 40},
            {"zone": "Industrial Sector 7", "aqi": 210, "temp": 34, "noise_db": 98},
            {"zone": "Coastal Road Extension", "aqi": 75, "temp": 27, "noise_db": 72},
            {"zone": "Residential Kurla", "aqi": 130, "temp": 29, "noise_db": 78},
            {"zone": "Forest Colony (Aarey)", "aqi": 28, "temp": 23, "noise_db": 30},
        ]
        for e in env_zones:
            db.session.add(Environment(**e))

        # 5. Energy & Utility Grids
        print("[5/9] Seeding Energy Consumption Grids...")
        for hour in range(24):
            load = 850 + random.randint(50, 300) if (18 <= hour <= 23) else 400 + random.randint(0, 150)
            solar = random.randint(70, 99) if (10 <= hour <= 15) else 0
            db.session.add(Energy(time=hour, power_load_mw=load, solar_efficiency=solar))

        # 6. Waste Management Fleet
        print("[6/9] Seeding Smart Waste Bin Network...")
        bins = [
            {"bin_id": "BIN-BKC-01", "location": "BKC G-Block", "fill_percentage": 92},
            {"bin_id": "BIN-BKC-02", "location": "BKC Diamond Plaza", "fill_percentage": 15},
            {"bin_id": "BIN-AND-44", "location": "Andheri Link Rd", "fill_percentage": 88},
            {"bin_id": "BIN-DDR-12", "location": "Dadar Flower Market", "fill_percentage": 99},
            {"bin_id": "BIN-WOR-09", "location": "Worli Seaface", "fill_percentage": 42},
            {"bin_id": "BIN-JHU-22", "location": "Juhu Tara Rd", "fill_percentage": 75},
            {"bin_id": "BIN-COL-05", "location": "Colaba Causeway", "fill_percentage": 10},
            {"bin_id": "BIN-THA-88", "location": "Thane Station East", "fill_percentage": 96},
        ]
        for b in bins:
            db.session.add(Waste(**b))

        # 7. Citizen Profiles (Indian Registry)
        print("[7/9] Seeding Master Citizen Registry...")
        users_data = [
            {"username": "user", "name": "Rajesh Kumar", "email": "rajesh.k@mumbai.gov.in", "mobile": "+91-9876543210", "address": "B-402, Royal Residency, Andheri West", "is_blocked": False},
            {"username": "priya", "name": "Priya Sharma", "email": "priya.s@delhi.gov.in", "mobile": "+91-9988776655", "address": "Flat 101, Golf Links, New Delhi", "is_blocked": False},
            {"username": "amit", "name": "Amit Patel", "email": "amit.p@citymail.in", "mobile": "+91-9123456780", "address": "Sai Arcade, Thane West", "is_blocked": False},
            {"username": "sneha", "name": "Sneha Gupta", "email": "sneha.g@outlook.com", "mobile": "+91-8877665544", "address": "12/A Green Park, South Delhi", "is_blocked": True},
            {"username": "vikram", "name": "Vikram Singh", "email": "v.singh@mumbai.in", "mobile": "+91-9000011111", "address": "Sagar Darshan, Worli Seaface", "is_blocked": False},
            {"username": "pooja", "name": "Pooja Deshmukh", "email": "pooja.d@pune.gov.in", "mobile": "+91-9222233333", "address": "Laxmi Chowk, Kothrud, Pune", "is_blocked": False},
            {"username": "anjali", "name": "Anjali Mehta", "email": "amehta@gujarat.in", "mobile": "+91-9444455555", "address": "Ambawadi, Ahmedabad", "is_blocked": False},
        ]
        
        seeded_users = []
        for u in users_data:
            new_u = User(
                username=u["username"],
                password_hash=generate_password_hash(f"{u['username']}123"),
                name=u["name"],
                email=u["email"],
                mobile=u["mobile"],
                address=u["address"],
                is_blocked=u["is_blocked"]
            )
            db.session.add(new_u)
            seeded_users.append(new_u)
        
        db.session.flush()

        # Vehicles
        db.session.add(Vehicle(plate_number="MH-02-AB-1234", user_id=seeded_users[0].id))
        db.session.add(Vehicle(plate_number="MH-12-XY-9999", user_id=seeded_users[0].id))
        db.session.add(Vehicle(plate_number="DL-04-CX-4321", user_id=seeded_users[1].id))
        db.session.add(Vehicle(plate_number="MH-04-KR-8821", user_id=seeded_users[2].id))
        db.session.add(Vehicle(plate_number="DL-01-CA-5567", user_id=seeded_users[3].id))
        db.session.add(Vehicle(plate_number="MH-01-AS-7777", user_id=seeded_users[4].id))
        db.session.add(Vehicle(plate_number="MH-12-PZ-8888", user_id=seeded_users[5].id))

        # 8. E-Challans & Grievances
        print("[8/9] Seeding Interaction Logs (Challans & Complaints)...")
        # Challans
        challans = [
            {"user_id": seeded_users[0].id, "user_username": "user", "vehicle": "MH-02-AB-1234", "violation": "Over-Speeding (>80km/h)", "amount": 2000, "status": "Pending", "date": "2026-04-20"},
            {"user_id": seeded_users[0].id, "user_username": "user", "vehicle": "MH-12-XY-9999", "violation": "Red Light Jump", "amount": 500, "status": "Paid", "date": "2026-04-10"},
            {"user_id": seeded_users[1].id, "user_username": "priya", "vehicle": "DL-04-CX-4321", "violation": "No Parking Zone", "amount": 1000, "status": "Pending", "date": "2026-04-22"},
            {"user_id": seeded_users[2].id, "user_username": "amit", "vehicle": "MH-04-KR-8821", "violation": "Dangerous Driving", "amount": 5000, "status": "Pending", "date": "2026-04-24"},
            {"user_id": seeded_users[4].id, "user_username": "vikram", "vehicle": "MH-01-AS-7777", "violation": "No Helmet", "amount": 500, "status": "Paid", "date": "2026-04-15"},
            {"user_id": seeded_users[5].id, "user_username": "pooja", "vehicle": "MH-12-PZ-8888", "violation": "Drunk Driving", "amount": 10000, "status": "Pending", "date": "2026-04-25"},
        ]
        for ch in challans:
            db.session.add(Challan(**ch))
            
        # Complaints
        complaints = [
            {"user_id": seeded_users[0].id, "user_username": "user", "title": "Streetlight broken in B-Wing", "dept": "Electricity Board", "status": "In Progress", "date": "2026-04-15"},
            {"user_id": seeded_users[0].id, "user_username": "user", "title": "Garbage not collected for 3 days", "dept": "Sanitation Dept", "status": "Resolved", "date": "2026-04-12"},
            {"user_id": seeded_users[1].id, "user_username": "priya", "title": "Main road pothole near Metro", "dept": "PWD", "status": "Open", "date": "2026-04-23"},
            {"user_id": seeded_users[4].id, "user_username": "vikram", "title": "Water leakage in sector 5", "dept": "Water Dept", "status": "Open", "date": "2026-04-26"},
            {"user_id": seeded_users[5].id, "user_username": "pooja", "title": "Illegal parking in my slot", "dept": "Traffic Police", "status": "Resolved", "date": "2026-04-20"},
            {"user_id": seeded_users[6].id, "user_username": "anjali", "title": "Noise pollution at midnight", "dept": "Local Police", "status": "In Progress", "date": "2026-04-27"},
        ]
        for cm in complaints:
            db.session.add(Complaint(**cm))

        # 9. Emergency Response SOS
        print("[9/9] Seeding Active Emergency Dispatch Logs...")
        emergencies = [
            {"type": "Major Vehicle Accident", "location": "BKC Flyover Exit", "status": "Active", "ambulance_dispatched": True, "police_dispatched": True},
            {"type": "Structural Fire", "location": "Industrial Area, Thane", "status": "Active", "fire_dispatched": True, "police_dispatched": True},
            {"type": "Medical Emergency (Cardiac)", "location": "Dadar Station Plat 1", "status": "Resolved", "ambulance_dispatched": True},
            {"type": "Bridge Collapse Alert", "location": "Sion Connector", "status": "Active", "police_dispatched": True, "fire_dispatched": True},
            {"type": "Armed Robbery Report", "location": "Jewellery Market, Zaveri", "status": "Active", "police_dispatched": True},
            {"type": "Flash Flood Warning", "location": "Milan Subway", "status": "Resolved", "police_dispatched": True},
        ]
        # 10. System Activity Logs
        print("[10/10] Seeding Master Activity Logs...")
        logs = [
            {"category": "Emergency", "title": "Critical Incident", "message": "Major accident reported at Bandra West Flyover. Emergency units deployed.", "severity": "High"},
            {"category": "Utility", "title": "Grid Warning", "message": "Low water pressure detected in Sector 4 Main Pipeline. Automated diagnostic running.", "severity": "Medium"},
            {"category": "Security", "title": "System Check", "message": "CCTV Grid integrity check completed. All 1,240 cameras online.", "severity": "Low"},
            {"category": "Traffic", "title": "Optimization Run", "message": "AI optimized signal timings at BKC Junction to reduce morning congestion.", "severity": "Low"},
            {"category": "Security", "title": "Intrusion Detection", "message": "Unauthorized access attempt blocked at Substation-7 digital firewall.", "severity": "High"},
            {"category": "Utility", "title": "Maintenance Alert", "message": "Solar grid cleaning scheduled for tonight in Juhu sector.", "severity": "Low"},
            {"category": "Emergency", "title": "SOS Resolved", "message": "Cardiac emergency at Dadar Station successfully handled by medical team.", "severity": "Medium"},
        ]
        from models import SystemLog
        for l in logs:
            db.session.add(SystemLog(**l))

        db.session.commit()
        print("--- All Relational Data Seeded Successfully ---")

if __name__ == "__main__":
    seed_database()
