from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from backend.database import init_db, get_all_events, get_event_data, get_event_by_key, create_event, update_event, delete_event

app = FastAPI()

# Initialize Database on startup
init_db()

class EventCreate(BaseModel):
    name: str
    data: dict

@app.get("/api/events")
async def api_get_events():
    return get_all_events()

@app.get("/api/events/{event_id}")
async def api_get_event(event_id: int):
    data = get_event_data(event_id)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")
    return data

@app.get("/api/events/manage/{host_key}")
async def api_get_event_manage(host_key: str):
    res = get_event_by_key(host_key)
    if not res:
        raise HTTPException(status_code=404, detail="Invalid host key or event not found.")
    return res

@app.post("/api/events")
async def api_create_event(event: EventCreate):
    new_id, host_key = create_event(event.name, event.data)
    return {"id": new_id, "name": event.name, "host_key": host_key}

class EventUpdate(BaseModel):
    name: str
    data: dict
    host_key: str

@app.put("/api/events/{event_id}")
async def api_update_event(event_id: int, event: EventUpdate):
    success = update_event(event_id, event.host_key, event.name, event.data)
    if not success:
        raise HTTPException(status_code=403, detail="Invalid host key or event not found.")
    return {"status": "updated"}

@app.delete("/api/events/{event_id}")
async def api_delete_event(event_id: int, host_key: str):
    success = delete_event(event_id, host_key)
    if not success:
        raise HTTPException(status_code=403, detail="Invalid host key or event not found.")
    return {"status": "deleted"}

# Deprecated, kept for safe measure
@app.get("/api/data")
async def get_data_legacy():
    return get_event_data(1)

@app.get("/")
async def serve_index():
    return FileResponse("index.html")

# Serve all other static assets (app.js, styles.css)
app.mount("/", StaticFiles(directory="."), name="static")
