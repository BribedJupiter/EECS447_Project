import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv() # Get .env file variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

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
def db_run_query(queryFunc):
    try:
        conn = db_connect()
        return queryFunc(conn)
    except Exception as e:
        print(f"Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()

def db_test_conn():
    return db_run_query(db_get_version)

def db_setup():
    return db_run_query(db_setup_tables)

def db_setup_tables(conn):
    """Create a set of tables in the database matching our specification."""
    cur = conn.cursor()

    # User
    cur.execute(
        "CREATE TABLE IF NOT EXISTS User(" \
            "id int AUTO_INCREMENT PRIMARY KEY," \
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