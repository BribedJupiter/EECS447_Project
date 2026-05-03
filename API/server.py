# System imports
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Server imports
from dbconn import db_test_conn, db_setup, db_get_user, db_put_user

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
        "https://bribedjupiter.github.io/EECS447_Project"
    ]
}})

# Flask app routes
@app.route("/")
def hello_world():
    version = db_test_conn()
    return {"message": version}

@app.route("/setup-db")
def setup_db():
    result = "disabled" # db_setup()
    return {"message": result}

@app.route("/user/<int:user_id>")
def get_user(user_id):
    result = db_get_user(user_id)
    return {"user": result}

@app.route("/user", methods=["PUT"])
def put_user():
    try:
        data = request.get_json() or {}
        user_id = db_put_user(data.get("name"), data.get("email"), data.get("phone"))
        if user_id is None:
            return {"error": "failed to insert row"}, 500
        else:
            return {"user_id":user_id}
    except Exception as e:
        print("ERROR:", e)
        return {"error": "unknown"}, 500

# If we're in a local build, run the server this way
if LOCAL:
    # Vercel handles running the app non-locally for us
    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=8000, debug=True)