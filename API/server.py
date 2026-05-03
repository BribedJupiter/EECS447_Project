# System imports
from flask import Flask
from dotenv import load_dotenv
import os

# Server imports
from dbconn import db_test_conn

# Load environment variables
load_dotenv() # Get .env file variables
LOCAL = os.getenv("LOCAL")

# Create a flask app
app = Flask(__name__)

# Flask app routes
@app.route("/")
def hello_world():
    version = db_test_conn()
    return {"message": version}

# If we're in a local build, run the server this way
if LOCAL:
    # Vercel handles running the app non-locally for us
    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=8000, debug=True)