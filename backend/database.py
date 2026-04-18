import sqlite3
import json
import os
import uuid

DB_PATH = "venue.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, data TEXT, host_key TEXT)''')
    
    cursor.execute("SELECT COUNT(*) FROM events")
    if cursor.fetchone()[0] == 0:
        seed_data(conn)
        
    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    mock_data = {
      'imageUrl': '/demo_stadium.png',
      'zones': {
        'north': { 'id': 'north', 'name': 'North Stand', 'density': 'low' },
        'south': { 'id': 'south', 'name': 'South Stand', 'density': 'high' },
        'east': { 'id': 'east', 'name': 'East Stand', 'density': 'med' },
        'west': { 'id': 'west', 'name': 'West Stand', 'density': 'low' }
      },
      'tickets': {
        'VIP-AA123': {
          'name': "Sahit SVK",
          'role': "vip",
          'seat': { 'zone': "east", 'label': "Suite 14B" },
          'itinerary': [
            { 'time': "17:00", 'event': "Private Stadium Tour", 'status': "completed", 'zone': "south" },
            { 'time': "22:30", 'event': "Pre-Match Buffet (East Lounge)", 'status': "active", 'zone': "east" },
            { 'time': "23:45", 'event': "Kickoff", 'status': "upcoming", 'zone': "east" },
            { 'time': "23:55", 'event': "Halftime Concierge Check-in", 'status': "upcoming", 'zone': "north" }
          ]
        },
        'FAN-456': {
          'name': "Alex Doe",
          'role': "fan",
          'seat': { 'zone': "west", 'label': "Block 212, Row F" },
          'itinerary': [
            { 'time': "18:00", 'event': "Gates Open", 'status': "completed", 'zone': "north" },
            { 'time': "19:45", 'event': "Match Start", 'status': "upcoming", 'zone': "west" },
            { 'time': "21:30", 'event': "Post-Match Fan Zone Event", 'status': "upcoming", 'zone': "south" }
          ]
        },
        'STAFF-001': {
          'name': "Security Lead Collins",
          'role': "staff",
          'seat': { 'zone': "south", 'label': "Control Room Alpha" },
          'itinerary': [
            { 'time': "15:00", 'event': "Briefing", 'status': "completed", 'zone': "west" },
            { 'time': "18:00", 'event': "Gate Control (South)", 'status': "active", 'zone': "south" },
            { 'time': "20:00", 'event': "Halftime Deployment", 'status': "upcoming", 'zone': "east" }
          ]
        }
      },
      'facilities': [
        { 'id': 'f1', 'name': 'Burger Stand', 'type': 'food', 'zone': 'north', 'waitTime': 5 },
        { 'id': 'f2', 'name': 'Pizza Hut', 'type': 'food', 'zone': 'south', 'waitTime': 12 },
        { 'id': 'f3', 'name': 'Hot Dog Cart', 'type': 'food', 'zone': 'east', 'waitTime': 15 },
        { 'id': 'f4', 'name': 'Vegan Bowl', 'type': 'food', 'zone': 'west', 'waitTime': 2 },
        { 'id': 'r1', 'name': 'North Restroom', 'type': 'restroom', 'zone': 'north', 'waitTime': 2 },
        { 'id': 'r2', 'name': 'South Restroom', 'type': 'restroom', 'zone': 'south', 'waitTime': 11 },
        { 'id': 'r3', 'name': 'East Restroom', 'type': 'restroom', 'zone': 'east', 'waitTime': 4 },
        { 'id': 'r4', 'name': 'West Restroom', 'type': 'restroom', 'zone': 'west', 'waitTime': 3 },
        { 'id': 'e1', 'name': 'Gate N', 'type': 'exit', 'zone': 'north', 'waitTime': 0 },
        { 'id': 'e2', 'name': 'Gate S', 'type': 'exit', 'zone': 'south', 'waitTime': 0 },
        { 'id': 'e3', 'name': 'Gate E', 'type': 'exit', 'zone': 'east', 'waitTime': 0 },
        { 'id': 'e4', 'name': 'Gate W', 'type': 'exit', 'zone': 'west', 'waitTime': 0 },
        { 'id': 't1', 'name': 'Metro (Red Line)', 'type': 'transport', 'zone': 'north', 'gate': 'Gate N' },
        { 'id': 't2', 'name': 'City Bus 45 & 99', 'type': 'transport', 'zone': 'south', 'gate': 'Gate S' },
        { 'id': 't3', 'name': 'Train Station', 'type': 'transport', 'zone': 'east', 'gate': 'Gate E' },
        { 'id': 'v1', 'name': 'VIP Lounge North', 'type': 'lounge', 'zone': 'north', 'waitTime': 0 },
        { 'id': 'v2', 'name': 'VIP Concierge', 'type': 'lounge', 'zone': 'east', 'waitTime': 1 }
      ],
      'alerts': [
        "Halftime starts in 10 minutes. Expect surges at South Stand."
      ]
    }
    
    cursor.execute("INSERT INTO events (name, data, host_key) VALUES (?, ?, ?)", ('StadiaSense Demo Event', json.dumps(mock_data), 'demo-admin'))
    conn.commit()

def get_all_events():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, data FROM events ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        try:
            data = json.loads(r[2])
            img = data.get('imageUrl', f"https://picsum.photos/seed/{r[0]}/400/300")
        except:
            img = f"https://picsum.photos/seed/{r[0]}/400/300"
            
        results.append({"id": r[0], "name": r[1], "imageUrl": img})
    return results

def get_event_data(event_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT data FROM events WHERE id=?", (event_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None

def get_event_by_key(host_key: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, data FROM events WHERE host_key=?", (host_key,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "data": json.loads(row[1])}
    return None

def create_event(name: str, data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    host_key = uuid.uuid4().hex[:8]
    cursor.execute("INSERT INTO events (name, data, host_key) VALUES (?, ?, ?)", (name, json.dumps(data), host_key))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id, host_key

def update_event(event_id: int, host_key: str, name: str, data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE events SET name = ?, data = ? WHERE id = ? AND host_key = ?", (name, json.dumps(data), event_id, host_key))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_event(event_id: int, host_key: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = ? AND host_key = ?", (event_id, host_key))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0
