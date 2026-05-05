import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv() # Get .env file variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

#####################################################
#                 DB Meta Functions                 #
#####################################################

def db_get_version(conn):
    cur = conn.cursor()
    cur.execute('SELECT VERSION();')
    result = (cur.fetchone()[0])
    cur.close()
    return result

def db_connect():
    conn = mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        ssl_disabled=False,
        autocommit=True)
    return conn

# queryFunc must be a function that takes 
def db_run_query(queryFunc, *args, **kwargs):
    try:
        conn = db_connect()
        return queryFunc(conn, *args, **kwargs)
    except Exception as e:
        print(f"Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()

def db_test_conn():
    return db_run_query(db_get_version)

#####################################################
#               Language Functions                  #
#####################################################

def db_get_langs():
    return db_run_query(db_get_lang_data)

def db_get_lang_data(conn):
    """Get the list of all languages."""
    cur = conn.cursor()
    cur.execute("SELECT * FROM Language;")
    result = cur.fetchall()
    cur.close()
    if result is None:
        return []
    else:
        # We know fetchall will return a list of lists of length 1
        data = []
        for lang in result:
            # Flatten the list
            data.append(lang[0])
        return data
    
def db_get_speaks(user_id):
    return db_run_query(db_get_speaks_data, user_id)

def db_get_speaks_data(conn, user_id):
    """Get all the language speaking data for a user."""
    cur = conn.cursor()
    cur.execute("SELECT language_name, target_or_fluent, skill_level FROM Speaks WHERE user_id=%s", (user_id,))
    result = cur.fetchall()
    cur.close()
    return result

def db_create_speaks(user_id, lang, type, skill):
    return db_run_query(db_create_speaks_data, user_id, lang, type, skill)

def db_create_speaks_data(conn, user_id, lang, type, skill):
    """Create a record about a user speaking a certain language."""
    # We know input will be valid since it is selected from a drop down menu
    cur = conn.cursor()
    try:
        cur.execute("START TRANSACTION;")
        cur.execute(
            "INSERT INTO Speaks (user_id, language_name, target_or_fluent, skill_level)" \
            "VALUES (%s, %s, %s, %s)",
            (user_id, lang, type, skill)
        )
        cur.execute("COMMIT;")
        return True
    except Exception as e:
        cur.execute("ROLLBACK;")
        print("INSERT Error", e)
        return False
    finally:
        cur.close()

#####################################################
#                 Meeting Functions                 #
#####################################################

def db_get_matching_users(user_id, lang, low_skill, high_skill, useAvailability):
    return db_run_query(db_get_matching_users_data, user_id, lang, low_skill, high_skill, useAvailability)

def db_get_matching_users_data(conn, user_id, lang, low_skill, high_skill, useAvailability):
    """Find all records of users matching the given criteria."""
    # Find users who are within the skill range, match the language, and have
    # compatible availability windows
    cur = conn.cursor()
    try:
        cur.execute("START TRANSACTION;")
        if useAvailability == "false":
            cur.execute("SELECT User.name, Speaks.language_name, Speaks.skill_level " \
                        "FROM User "
                        "INNER JOIN Speaks ON Speaks.user_id=User.id " \
                        "WHERE User.id<>%s " \
                        "AND Speaks.language_name=%s " \
                        "AND Speaks.skill_level>=%s " \
                        "AND Speaks.skill_level<=%s;"
                        , (user_id, lang, low_skill, high_skill)
            )
        else:
            cur.execute("SELECT DISTINCT u.name, s.language_name, s.skill_level, a.date, a.start_time, a.end_time " \
                        "FROM ( " \
                            # Find all of the availability records with user_ids that are compatible with the requesting user's availability
                            # Note this will already be filtered to only times compatible with the requesting user.
                            "SELECT a2.user_id, a2.date, a2.start_time, a2.end_time " \
                            "FROM Availability a1 " \
                            "INNER JOIN Availability a2 ON a1.user_id<>a2.user_id " \
                            "WHERE a1.user_id=%s " \
                            "AND a1.date=a2.date " \
                            "AND (a2.start_time >= a1.start_time " \
                            "OR a2.end_time <= a1.end_time) " \
                            "AND a2.start_time <= a2.end_time " \
                        ") AS a " \
                        # Note here we are joining with the users who are NOT the reuqesting user 
                        # (we're not searching for our own data)
                        "INNER JOIN User u ON a.user_id=u.id " \
                        "INNER JOIN Speaks s ON a.user_id=s.user_id " \
                        "WHERE s.language_name=%s " \
                        "AND s.skill_level>=%s " \
                        "AND s.skill_level<= %s;"
                        , (user_id, lang, low_skill, high_skill) 
            )
        results = cur.fetchall()
        cur.execute("COMMIT;")
        return results
    except Exception as e:
        cur.execute("ROLLBACK;")
        print("SELECT Error", e)
        return []
    finally:
        cur.close()

#####################################################
#       Availability Window Functions               #
#####################################################

def db_create_window(user_id, date, start_time, end_time):
    return db_run_query(db_create_window_data, user_id, date, start_time, end_time)

def db_create_window_data(conn, user_id, date, start_time, end_time):
    """Create an availability window for a particular user."""
    cur = conn.cursor()
    try:
        cur.execute("START TRANSACTION;")
        cur.execute(
            "INSERT INTO Availability (user_id, date, start_time, end_time)" \
            "VALUES (%s, %s, %s, %s)",
            (user_id, date, start_time, end_time)
        )
        cur.execute("COMMIT;")
        return True
    except Exception as e:
        cur.execute("ROLLBACK;")
        print("INSERT Error", e)
        return False
    finally:
        cur.close()

def db_get_windows(user_id):
    return db_run_query(db_get_windows_data, user_id)

def db_get_windows_data(conn, user_id, limit=25):
    """Get the last ${limit} known availability windows for a user"""
    cur = conn.cursor()
    cur.execute("SELECT date, start_time, end_time FROM Availability WHERE user_id=%s", (user_id,))
    result = cur.fetchall()
    cur.close()
    if result is None:
        return None
    return result

#####################################################
#                 User Data Functions               #
#####################################################

def db_get_user(user_id):
    return db_run_query(db_get_user_data, user_id)

def db_get_user_data(conn, user_id):
    """Retrieve the data matching a particular user_id."""
    cur = conn.cursor()
    params = [user_id]
    cur.execute(
        "SELECT * FROM User WHERE id=%s;", 
        params
    )
    result = cur.fetchall()
    cur.close()
    if result is None:
        return None
    else:
        return result[0]

def db_get_user_by_username(username):
    user_id = db_run_query(db_get_user_id_by_username, username)
    if user_id is None:
        return None
    return db_run_query(db_get_user_data, user_id)

def db_get_user_id_by_username(conn, username):
    """Get a user's ID from their username, or return None."""
    cur = conn.cursor()
    cur.execute(
        "SELECT id FROM User WHERE username=%s;",
        (username,) # , is so that this is read as a tuple
    )
    result = cur.fetchone()
    cur.close()
    if result is None:
        return None
    else:
        return result[0] # return the user id

def db_put_user(username, name, email, phone):
    user_id = db_run_query(db_put_user_data, username, name, email, phone)
    return db_run_query(db_get_user_data, user_id)

def db_put_user_data(conn, username, name, email, phone):
    """Insert a user's data into the database, creating a new user."""
    cur = conn.cursor()
    try:
        # Start a new transaction
        cur.execute(
            "START TRANSACTION;"
        )
        # Execute our insert
        cur.execute(
            "INSERT INTO User (username, name, email, phone) VALUES (%s, %s, %s, %s);", 
            (username, name, email, phone) 
        ) # id is automatically created using MySQL's AUTO_INCREMENT
        # Return back the new user_id
        user_id = cur.lastrowid
        # Commit our transaction and return
        cur.execute("COMMIT;")
        return user_id
    except Exception as e:
        cur.execute("ROLLBACK;")
        print("INSERT Error", e)
    finally:
        cur.close()

#####################################################
#             Databse Setup Functions               #
#####################################################

def db_set_languages():
    return db_run_query(db_set_language_data)

def db_set_language_data(conn):
    """Fill the Language table with a list of languages."""
    langs = ["English", "Spanish", "Portuguese", "French", "Arabic", "Mandarin", "Thai", "Polish", "Cantonese", "German", "Italian",
             "Japanese", "Russian", "Korean", "Bengali", "Sign/Body", "Hebrew", "Kazakh", "Hindi", "Urdu", "Vietnamese", "Indonesian", 
             "Swahili", "Navajo"]
    cur = conn.cursor()
    try:
        cur.execute("START TRANSACTION;")
        for lang in langs:
            cur.execute("INSERT INTO Language (name) VALUES (%s)", (lang,))
        cur.execute("COMMIT;")
        return True
    except Exception as e:
        cur.execute("ROLLBACK");
        print("INSERT Error", e)
    finally:
        cur.close()

def db_setup():
    return db_run_query(db_setup_tables)

def db_setup_tables(conn):
    """Create a set of tables in the database matching our specification."""
    cur = conn.cursor()

    # User
    cur.execute(
        "CREATE TABLE IF NOT EXISTS User(" \
            "id int AUTO_INCREMENT PRIMARY KEY," \
            "username varchar(50) NOT NULL UNIQUE," \
            "name varchar(50)," \
            "email varchar(50)," \
            "phone int" \
        ");"
    )

    # Language
    cur.execute(
        "CREATE TABLE IF NOT EXISTS Language(" \
            "name varchar(50) PRIMARY KEY" \
        ");"
    )

    # Speaks (capture the relationships between user and language)
    cur.execute(
        "CREATE TABLE IF NOT EXISTS Speaks(" \
            "user_id int," \
            "language_name varchar(50)," \
            "target_or_fluent varchar(50)," \
            "skill_level int," \
            "PRIMARY KEY (user_id, language_name)," \
            "FOREIGN KEY (user_id) REFERENCES User(id)," \
            "FOREIGN KEY (language_name) REFERENCES Language(name)" \
        ");"
    )

    # Availability windows
    cur.execute(
        "CREATE TABLE IF NOT EXISTS Availability(" \
            "user_id int," \
            "date date," \
            "start_time datetime," \
            "end_time datetime," \
            "PRIMARY KEY (user_id, date, start_time, end_time)," \
            "FOREIGN KEY (user_id) REFERENCES User(id)" \
        ");"
    )

    # Meeting
    cur.execute(
        "CREATE TABLE IF NOT EXISTS Meeting(" \
            "id int AUTO_INCREMENT PRIMARY KEY," \
            "date date," \
            "time datetime," \
            "location varchar(50)," \
            "language_name varchar(50)," \
            "FOREIGN KEY (language_name) REFERENCES Language(name)"
        ");"
    )

    # Attendance
    cur.execute(
        "CREATE TABLE IF NOT EXISTS Attends(" \
            "user_id int," \
            "meeting_id int," \
            "PRIMARY KEY (user_id, meeting_id)," \
            "FOREIGN KEY (user_id) REFERENCES User(id)," \
            "FOREIGN KEY (meeting_id) REFERENCES Meeting(id)" \
        ");"
    )

    # Close execution cursor
    cur.close()