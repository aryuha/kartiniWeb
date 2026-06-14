# backend/test_db.py

import mysql.connector

try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="reaktorkartini"
    )
    print("✅ Koneksi berhasil!")
    db.close()
except Exception as e:
    print(f"❌ Koneksi gagal: {e}")