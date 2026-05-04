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