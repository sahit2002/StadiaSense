# ⚡ StadiaSense

StadiaSense is an intelligent, real-time assistant built for attendees at large-scale sporting and entertainment events. It delivers seamless, safe, and enjoyable crowd management without typing, using an intuitive tap-only interface.

## 🌟 Core Features

- **Ticket-Based Identity Portal**: Discards generic user roles in favor of a secure, responsive access portal. Participants enter their assigned Ticket ID (e.g. `VIP-AA123`) which binds their local session to explicit names, roles, exact seat vectors, and personal itineraries.
- **Glassmorphism Design System**: Built with visceral impact in mind—featuring heavy `-webkit-backdrop-filter` blurring, dynamic hovering spring-physics, immersive drop-shadows, and device-agnostic responsive grids stacking perfectly on mobile.
- **Interactive Event Timelines**: An automated state-engine tracking the user's specific schedule. Users actively "Check In" to timeline events via dynamic modals, triggering autonomous SVG map routing pointing directly to their next venue!
- **Triple-Persona Engine**: One unified codebase resolves explicitly from the provided Ticket context:
  - **Fan**: Event progression, generic seat routes, and shortest-path concession algorithms.
  - **VIP**: Premium gold visual theming, instant Suite-level routing, and dynamic concierges.
  - **Staff**: High-density alerts, emergency routing, and red-themed security visual modes.
- **Inline SVG Autonomous Mapping**: Real-time vector rendering connecting mathematically generated Bezier curves between zones autonomously whenever a user shifts schedule states.

## 🛠️ Architecture & Constraints

StadiaSense is built entirely offline utilizing native web technology to remain ultra-performant and universally compatible. 

- **Frontend**: Vanilla HTML5, CSS3 (Variables, Flexbox, Keyframes), Vanilla JavaScript (ES6).
- **Dependencies**: None. 0 npm packages, 0 frameworks, 0 SDKs. No React, mapping overlays, or font libraries are used. Fully leverages system fonts and Inline SVGs. 
- **Data Simulation**: Relies entirely on robust, in-memory JSON objects representing zones, active alerts, schedules, and densities. No database connections are necessary.
- **Size Allocation**: Under 20KB total package size. Boot up is unhindered by external script loads. 

## 🚀 Running the Project

Because the repository is entirely independent, setup is instantaneous. 

1. Clone or download the repository.
2. In your file explorer, locate and launch `index.html` directly in any modern browser.
3. *Note: Enter demo Ticket IDs like `VIP-AA123`, `FAN-456`, or `STAFF-001` to instantly explore different roles, seat pathing, and active itineraries. You can clear your browser storage to reset.*

### Deploying to Google Cloud Run

We have included a `Dockerfile` and optimized `nginx.conf` designed explicitly for Google Cloud Run containerized hosting.

1. Build your container image:
   ```bash
   docker build -t stadiasense-app .
   ```
2. Test the container locally (optional):
   ```bash
   docker run -p 8080:8080 stadiasense-app
   ```
3. Deploy directly to Cloud Run via the Google Cloud Console or CLI:
   ```bash
   gcloud run deploy stadiasense --source . --port 8080 --allow-unauthenticated
   ```