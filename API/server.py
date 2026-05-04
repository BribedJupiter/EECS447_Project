# System imports
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Server imports
from dbconn import db_test_conn, db_setup, db_get_user, db_put_user, db_get_user_by_username, db_create_window

# Load environment variables
load_dotenv() # Get .env file variables
LOCAL = os.getenv("LOCAL")

# Create a flask app
app = Flask(__name__)

# Stop CORS errors by allowing these domains
CORS(app, resources={r"/*": {
    "origins":[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "https://bribedjupiter.github.io/EECS447_Project",
        "https://bribedjupiter.github.io"
    ]
}})

#####################################################
#             Databse Setup Functions               #
#####################################################

# Flask app routes
@app.route("/")
def hello_world():
    version = db_test_conn()
    return {"message": version}, 200

@app.route("/setup-db")
def setup_db():
    result = "disabled" # db_setup()
    return {"message": result}, 200

#####################################################
#       Availability Window Functions               #
#####################################################

@app.route("/availability/<int:user_id>", methods=["PUT"])
def create_window(user_id):
    try:
        data = request.get_json() or {}
        result = db_create_window(user_id, data.get("date"), data.get("start_time"), data.get("end_time"))
        if result is None or result == False:
            return {"error": "failed to insert row"}, 500
        else:
            return jsonify({
                "success": result
            }), 200
    except Exception as e:
        print("ERROR:", e)
        return {"error": "unknown"}, 500

#####################################################
#                 User Data Functions               #
#####################################################

@app.route("/user/<int:user_id>")
def get_user(user_id):
    result = db_get_user(user_id)
    if result is None:
        return {"error": "user not found"}, 404
    return jsonify({
            "id": result[0],
            "username": result[1],
            "name": result[2],
            "email": result[3],
            "phone": result[4],
    }), 200

@app.route("/user/<string:username>")
def get_user_username(username):
    result = db_get_user_by_username(username)
    if result is None:
        return {"error":"user not found"}, 404
    return jsonify({
        "id": result[0],
        "username": result[1],
        "name": result[2],
        "email": result[3],
        "phone": result[4],
    }), 200

@app.route("/user", methods=["PUT"])
def put_user():
    try:
        data = request.get_json() or {}
        result = db_put_user(data.get("username"), data.get("name"), data.get("email"), data.get("phone"))
        if result is None:
            return {"error": "failed to insert row"}, 500
        else:
            return jsonify({
                "id": result[0],
                "username": result[1],
                "name": result[2],
                "email": result[3],
                "phone": result[4],
            }), 200
    except Exception as e:
        print("ERROR:", e)
        return {"error": "unknown"}, 500

# If we're in a local build, run the server this way
if LOCAL:
    # Vercel handles running the app non-locally for us
    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=8000, debug=True)