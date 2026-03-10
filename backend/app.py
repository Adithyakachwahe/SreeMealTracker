from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, date
import os

app = Flask(__name__)
CORS(app)

MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["meal_tracker"]
logs_col    = db["intake_logs"]
water_col   = db["water_logs"]
weight_col  = db["weight_logs"]

# ─── Meal Plan Data ───────────────────────────────────────────────
MEAL_PLAN = {
    "user": {
        "name": "Sree",
        "current_weight": 64,
        "target_weight": 50,
        "height": 158,
        "age": 24,
        "gender": "Female",
        "calories": 1400,
        "diet": "North Indian Non Veg",
        "goal": "Lose Weight"
    },
    "macros": {
        "protein_katoris": 4,
        "carbs_katoris": 2,
        "veggies_katoris": 4,
        "fats_per_day": "~3g"
    },
    "plate": {
        "protein": "25%",
        "non_starchy_veggies": "50%",
        "starchy_grains": "25%"
    },
    "weekly_plan": {
        "Monday": {
            "detox": "Cucumber and Mint drink",
            "meal1": ["Greek Yoghurt (1 katori)", "Fresh Strawberries (1 piece)"],
            "meal2": ["Grilled Chicken (1 katori)", "Cucumber and Carrot Salad (2 katori)"],
            "meal3": ["Missi Roti - more besan (2 piece)", "Veg Khorma (2 katori)"],
            "snack1": ["Apple (1 piece)", "Walnuts + Sunflower Seeds (20g)"],
            "snack2": ["Regular/Almond Milk (1 glass)", "Pumpkin Seeds + Almonds (10g)"]
        },
        "Tuesday": {
            "detox": "Lemon, Honey and Ginger Detox Water",
            "meal1": ["Low Fat Paneer Sabji (1 katori)", "Sauteed Vegetables (1 katori)"],
            "meal2": ["Moong Dal (2 katori)", "Veg Khorma (2 katori)"],
            "meal3": ["Missi Roti - more besan (2 piece)", "Bottle Gourd Sabji (2 katori)"],
            "snack1": ["Pear (1 piece)", "Almonds + Walnuts (20g)"],
            "snack2": ["Thin Buttermilk (1 glass)", "Pumpkin Seeds + Sunflower Seeds (10g)"]
        },
        "Wednesday": {
            "detox": "Cinnamon and Tulsi Detox Water",
            "meal1": ["Low Fat Paneer Sabji (1 katori)", "Veggies in Sabji (2 katori)"],
            "meal2": ["Chicken Curry (1 katori)", "Kadai Vegetable (3 katori)"],
            "meal3": ["Missi Roti - more besan (2 piece)", "Onion, Garlic, Bell Pepper Sauteed (2 katori)"],
            "snack1": ["Guava (1 piece)", "Trail Mix of Unsalted Nuts (20g)"],
            "snack2": ["Greek Yoghurt (1 katori)", "Peanut Butter Unsalted (10g)"]
        },
        "Thursday": {
            "detox": "Cumin and Fenugreek Seeds Water",
            "meal1": ["Mixed Dal Dosa (2 piece)", "Sauteed Vegetables - Red, Yellow, Green Capsicum, Cauliflower (2 katori)"],
            "meal2": ["Rajma (1 katori)", "Mix Veg Raita (2 katori)"],
            "meal3": ["Egg Bhurji - 2 eggs (2 katori)", "Carrot Cucumber Salad (2 katori)"],
            "snack1": ["Watermelon (1 piece)", "Trail Mix of Unsalted Nuts (20g)"],
            "snack2": ["Skimmed Milk (1 glass)", "Peanut Butter Unsalted (10g)"]
        },
        "Friday": {
            "detox": "Coriander, Ginger and Lemon Water",
            "meal1": ["Scrambled Eggs - 2 eggs (1 katori)", "Carrot Pineapple Pomegranate Salad (1 katori)"],
            "meal2": ["Paneer Curry (1 katori)", "Tomato Cucumber Salad (2 katori)"],
            "meal3": ["Missi Roti - more besan (2 piece)", "Gobi Mutter Sabji (2 katori)"],
            "snack1": ["Pear (1 piece)", "Peanut Butter Unsalted (20g)"],
            "snack2": ["Greek Yoghurt Plain (1 katori)", "Trail Mix of Unsalted Nuts (10g)"]
        },
        "Saturday": {
            "detox": "Apple Beetroot Carrot Juice",
            "meal1": ["Sauteed Soya Chunks (1 katori)", "Onion, Peas, Carrot, Tomatoes for Upma (2 katori)"],
            "meal2": ["Dal Makhani (1 katori)", "Radish Onion Salad (2 katori)"],
            "meal3": ["Masala Egg Curry (1 katori)", "Carrot Cucumber Salad (2 katori)"],
            "snack1": ["Pomegranate (1 piece)", "Roasted Peanuts (20g)"],
            "snack2": ["Rajma Salad (1 katori)", "Extra Virgin Olive Oil (10g)"]
        },
        "Sunday": {
            "detox": "Lemon Tulsi Black Pepper Water",
            "meal1": ["Scrambled Eggs - 2 pieces (2 piece)", "Onion Garlic Mushroom Sauteed (1 katori)"],
            "meal2": ["Chicken Bharta (1 katori)", "Cauliflower and Green Beans Sabji (2 katori)"],
            "meal3": ["Chicken Keema (1 katori)", "Cucumber Salad (2 katori)"],
            "snack1": ["Guava (1 piece)", "Almonds and Walnuts (20g)"],
            "snack2": ["Greek Yoghurt (1 katori)", "Peanut Butter Unsalted (10g)"]
        }
    }
}

# ─── Meal Plan ────────────────────────────────────────────────────
@app.route("/api/meal-plan", methods=["GET"])
def get_meal_plan():
    return jsonify(MEAL_PLAN)

# ─── Intake Logging ───────────────────────────────────────────────
@app.route("/api/log", methods=["POST"])
def log_intake():
    data = request.json
    today = date.today().isoformat()
    entry = {
        "date": today,
        "day": data.get("day"),
        "meal_type": data.get("meal_type"),
        "item": data.get("item"),
        "is_custom": data.get("is_custom", False),   # ← NEW: flag for custom/alternative meals
        "consumed": data.get("consumed", True),
        "notes": data.get("notes", ""),
        "timestamp": datetime.utcnow()
    }
    logs_col.insert_one(entry)
    entry.pop("_id", None)
    return jsonify({"success": True, "entry": entry}), 201

@app.route("/api/log/<date_str>", methods=["GET"])
def get_logs(date_str):
    logs = list(logs_col.find({"date": date_str}, {"_id": 0}))
    return jsonify(logs)

@app.route("/api/log", methods=["DELETE"])
def delete_log():
    data = request.json
    logs_col.delete_one({
        "date": data.get("date"),
        "meal_type": data.get("meal_type"),
        "item": data.get("item")
    })
    return jsonify({"success": True})

# ─── Water ────────────────────────────────────────────────────────
@app.route("/api/water", methods=["POST"])
def log_water():
    data = request.json
    today = date.today().isoformat()
    existing = water_col.find_one({"date": today})
    if existing:
        water_col.update_one({"date": today}, {"$set": {"glasses": data.get("glasses", 0)}})
    else:
        water_col.insert_one({"date": today, "glasses": data.get("glasses", 0)})
    return jsonify({"success": True})

@app.route("/api/water/<date_str>", methods=["GET"])
def get_water(date_str):
    doc = water_col.find_one({"date": date_str}, {"_id": 0})
    return jsonify(doc or {"date": date_str, "glasses": 0})

# ─── Weight Tracking (NEW) ────────────────────────────────────────
@app.route("/api/weight", methods=["POST"])
def log_weight():
    data = request.json
    weight = data.get("weight")
    if weight is None:
        return jsonify({"error": "weight required"}), 400
    today = date.today().isoformat()
    existing = weight_col.find_one({"date": today})
    if existing:
        weight_col.update_one({"date": today}, {"$set": {"weight": weight, "timestamp": datetime.utcnow()}})
    else:
        weight_col.insert_one({"date": today, "weight": weight, "timestamp": datetime.utcnow()})
    return jsonify({"success": True, "date": today, "weight": weight})

@app.route("/api/weight/<date_str>", methods=["GET"])
def get_weight(date_str):
    doc = weight_col.find_one({"date": date_str}, {"_id": 0, "timestamp": 0})
    return jsonify(doc or {"date": date_str, "weight": None})

@app.route("/api/weight/history/all", methods=["GET"])
def get_weight_history():
    docs = list(weight_col.find({}, {"_id": 0, "timestamp": 0}).sort("date", 1).limit(90))
    return jsonify(docs)

@app.route("/api/weight/<date_str>", methods=["DELETE"])
def delete_weight(date_str):
    weight_col.delete_one({"date": date_str})
    return jsonify({"success": True})

# ─── History ──────────────────────────────────────────────────────
@app.route("/api/history", methods=["GET"])
def get_history():
    pipeline = [
        {"$group": {"_id": "$date", "count": {"$sum": 1}}},
        {"$sort": {"_id": -1}},
        {"$limit": 30}
    ]
    result = list(logs_col.aggregate(pipeline))
    return jsonify([{"date": r["_id"], "count": r["count"]} for r in result])

if __name__ == "__main__":
    app.run(debug=True, port=5000)