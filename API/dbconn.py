import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv() # Get .env file variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

conn = None
try:
    conn = mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        ssl_disabled=False,
        autocommit=True,
    ssl_ca='./global-bundle.pem'
    )
    cur = conn.cursor()
    cur.execute('SELECT VERSION();')
    print(cur.fetchone()[0])
    cur.close()
except Exception as e:
    print(f"Database error: {e}")
    raise
finally:
    if conn:
        conn.close()