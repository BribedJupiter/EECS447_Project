# System imports
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Server imports
from dbconn import (db_test_conn, db_setup, db_get_user, db_put_user, db_get_user_by_username, 
                    db_create_window, db_get_windows, db_set_languages, db_get_langs,
                    db_create_speaks, db_get_speaks, db_get_matching_users,
                    db_resize_window_subsection, db_schedule_meeting,
                    db_get_meetings)

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

@app.route("/setup-languages")
def setup_languages():
    result = "disabled" # db_set_languages()
    return {"message": result}, 200

#####################################################
#              Language Functions                   #
#####################################################

@app.route("/language")
def get_langs():
    result = db_get_langs()
    return jsonify(result)

@app.route("/language/<int:user_id>")
def get_speaks(user_id):
    result = db_get_speaks(user_id)
    if result is None or len(result) <= 0:
        return {"error": "user not found"}, 404
    return jsonify(result), 200

@app.route("/language/<int:user_id>", methods=["PUT"])
def create_speaks(user_id):
    try:
        data = request.get_json() or {}
        result = db_create_speaks(user_id, data.get("lang"), data.get("type"), data.get("skill"))
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
#                 Meeting Functions                 #
#####################################################

@app.route("/schedule/<int:user_id>")
def get_matching_users(user_id):
    try: 
        lang = request.args.get("lang")
        low_skill = request.args.get("low_skill")
        high_skill = request.args.get("high_skill")
        useAvailability = request.args.get("useAvailability")
        result = db_get_matching_users(user_id, lang, low_skill, high_skill, useAvailability)
        dataArr = []
        for i in result:
            # If we want availability data
            if len(i) == 9:
                # Skip potentially invalid entries - in case timestamps are bad
                if i[3] is None or i[4] is None or i[5] is None or i[6] is None or i[7] is None or i[8] is None:
                    continue
                # i will be a tuple of 8 objects
                date = i[3].strftime('%Y-%m-%d')
                start = i[4].strftime('%H:%M')
                end = i[5].strftime('%H:%M')
                req_start = i[6].strftime('%H:%M')
                req_end = i[7].strftime('%H:%M')
                dataArr.append((i[0], i[1], i[2], date, date + "T" + start, date + "T" + end, date + "T" + req_start, date + "T" + req_end, i[8]))
            # If we just want matches
            elif len(i) == 3:
                dataArr.append((i[0], i[1], i[2]))
            else:
                continue
        return jsonify(dataArr)
    except Exception as e:
        print("ERROR:", e)
        return {"error": "unknown"}, 500
    
@app.route("/schedule/<int:user_id1>/<int:user_id2>", methods=["PUT"])
def schedule_meeting(user_id1, user_id2):
    try:
        data = request.get_json() or {}
        # Add meeting to meeting, get back meeting_id
        result = db_schedule_meeting(user_id1, user_id2, data.get("date"), data.get("start_time"), data.get("location"), data.get("language"))
        if result == False:
            return {"error": "failed to create meeting"}, 500
        return jsonify({
            "status": "success"
        }), 200
    except Exception as e:
        print("ERROR:", e)
        return {"error": "unknown"}, 500
    
@app.route("/schedule/meetings/<int:user_id>")
def get_meetings(user_id):
    try:
        result = db_get_meetings(user_id)
        if result is None or result == []:
            return jsonify([])
        return jsonify(result)
    except Exception as e:
        print("ERROR", e)
        return {"error": "unknown"}, 500

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
    
@app.route("/availability/<int:user_id>", methods=["POST"])
def resize_window_subsection(user_id):
    try:
        date = request.args.get("date")
        new_start_time = request.args.get("start_time")
        new_end_time = request.args.get("end_time")
        result = db_resize_window_subsection(user_id, date, new_start_time, new_end_time)
        if result is None or result == False:
            return {"error": "failed to delete availability"}, 500
        else:
            return jsonify({
                "success": result
            }), 200
    except Exception as e:
        print("ERROR:", e)
        return {"error": "unknown"}, 500
    
@app.route("/availability/<int:user_id>")
def get_windows(user_id):
    result = db_get_windows(user_id)
    if result is None or len(result) <= 0:
        return {"error": "user not found"}, 404
    dataArr = []
    for i in result:
       # Skip potentially invalid entries
       if i[0] is None or i[1] is None or i[2] is None:
           continue
       
       # i will be a tuple of 3 objects: a datetime.date, and two datetime.datetimes
       date = i[0].strftime('%Y-%m-%d')
       start = i[1].strftime('%H:%M')
       end = i[2].strftime('%H:%M')
       dataArr.append((date, date + "T" + start, date + "T" + end))
    return jsonify(dataArr), 200

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