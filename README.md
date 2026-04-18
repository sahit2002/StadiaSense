# ⚡ StadiaSense Platform

StadiaSense is an intelligent, multi-tenant Event Management Platform built for large-scale sporting and entertainment events. It delivers seamless, safe, and enjoyable crowd management without typing, using an intuitive tap-only interface.

## 🌟 Core Features

- **Multi-Tenant Event Grid**: Organizers can dynamically generate, deploy, and decommission independent configurations instantly. Users are presented with a beautiful landing portal featuring a responsive Discovery grid.
- **Ticket-Based Identity Portal**: Discards generic user roles in favor of a secure, responsive access portal. Participants enter their assigned Ticket ID (e.g. `VIP-AA123`) which binds their local session to explicit names, roles, exact seat vectors, and personal itineraries.
- **Secure Host Identifiers**: The SQLite/FastAPI backend generates a unique cryptographic `uuid` slice upon event creation. Organizers must use this exact Host Key to `PUT` or `DELETE` their architecture natively, preventing unauthorized venue decommissioning.
- **Glassmorphism Design System**: Built with visceral impact in mind—featuring heavy `-webkit-backdrop-filter` blurring, dynamic hovering spring-physics, immersive drop-shadows, and device-agnostic responsive grids stacking perfectly on mobile.
- **Interactive Event Timelines**: An automated state-engine tracking the user's specific schedule. Users actively "Check In" to timeline events via dynamic modals, triggering autonomous SVG map routing pointing directly to their next venue!

## 🛠️ Architecture & Constraints

StadiaSense has evolved into a robust Full-Stack application.

- **Frontend**: Vanilla HTML5, CSS3 (Variables, Flexbox, Keyframes), Vanilla JavaScript (ES6). No frontend frameworks.
- **Backend API**: `FastAPI` powered RESTful layer exposing dynamic CRUD loops via `GET`, `POST`, `PUT`, and `DELETE` routers.
- **Database**: Localized `sqlite3` driver writing architecture cleanly to `venue.db`. 
- **Inline SVG Autonomous Mapping**: Real-time vector rendering connecting mathematically generated Bezier curves between zones autonomously whenever a user shifts schedule states.

## 🚀 Running the Project

1. Clone or download the repository.
2. Ensure you have Python installed and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI Uvicorn Server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
4. Navigate to `http://localhost:8000` in your web browser. 

*Note: Enter demo Ticket IDs like `VIP-AA123`, `FAN-456`, or `STAFF-001` to instantly explore different roles, seat pathing, and active itineraries. Explore the "Host an Event" tab to deploy your own JSON templates.*

### Deploying to Google Cloud Run

We have included a `Dockerfile` designed explicitly for Google Cloud Run containerized hosting.

1. Build your container image:
   ```bash
   docker build -t stadiasense-app .
   ```
2. Test the container locally:
   ```bash
   docker run -p 8080:8080 stadiasense-app
   ```
3. Deploy directly to Cloud Run:
   ```bash
   gcloud run deploy stadiasense --source . --port 8080 --allow-unauthenticated
   ```