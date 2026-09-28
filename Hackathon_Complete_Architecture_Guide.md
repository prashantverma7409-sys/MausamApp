# MausamApp: Complete Hackathon Architecture & Pitch Guide

This document is your master reference for the hackathon pitch. It contains every detail about the prototype, the pipeline, the files, and the current live features.

---

## 1. Programming Languages Used
*   **JavaScript (ES6+) & JSX**: Used exclusively for the Frontend (Mobile App logic, UI rendering, State Management).
*   **Python (3.x)**: Used exclusively for the Backend (API routing, Caching, AI API orchestration, Data fetching).
*   **JSON**: Used as the universal data-exchange language between the frontend, backend, weather APIs, and the AI model.

---

## 2. Components & Tools (Current Tech Stack)
### Frontend (Mobile Application)
*   **React Native**: The core mobile framework allowing us to write once and deploy to both Android and iOS.
*   **Expo (SDK 57)**: The toolchain used for rapid deployment, testing, and accessing device APIs.
*   **React Native Reanimated & Linear Gradient**: Used for the smooth UI transitions and glassmorphism design.
*   **Expo Location**: Used to calculate coordinates and handle reverse geocoding.

### Backend (Orchestration & Logic)
*   **FastAPI (Python)**: An incredibly fast, asynchronous web framework used to build our backend REST API.
*   **Uvicorn**: The ASGI server running the FastAPI application.

### Artificial Intelligence & External Data
*   **Groq API (Meta Llama-3.1-8B-Instant)**: Our primary AI Inference engine. Used because it is open-source, blistering fast, and highly capable of generating structured JSON advisories.
*   **Open-Meteo API**: Our live data source for real-time temperature, humidity, wind, and AQI.

---

## 3. The Complete Pipeline (Data Flow)
When a user interacts with the app, this is the exact flow of data:
1.  **Trigger**: The user selects a Location (e.g., Pune), changes their Persona (e.g., Farmer), or overrides the Time of Day.
2.  **State Update**: React Native updates the global `WeatherContext`.
3.  **The Request**: The mobile app packages the `latitude`, `longitude`, `persona`, and `time` into a JSON payload and sends a `POST` request to the Python Backend (`/api/action-cards`).
4.  **Geo-Caching (Interception)**: The backend calculates a `cache_key`. If this exact scenario was requested by another user in the last 30 minutes, it instantly returns the saved response (saving AI costs).
5.  **Live Telemetry Fetch**: If it's a cache miss, `data_fetcher.py` hits the Open-Meteo API to get the *real* weather for those exact GPS coordinates.
6.  **AI Inference**: The backend builds a strict prompt combining the live weather numbers + the user's Persona, and sends it to the **Groq API (Llama 3)** enforcing a strict JSON output.
7.  **The Response**: The AI's custom advice and the raw weather numbers are merged into one JSON object and sent back to the phone.
8.  **UI Render**: React Native dynamically renders the custom Action Cards and telemetry grids on the screen.

---

## 4. File Breakdown & Topics
Here is exactly what we built and what domain each file belongs to:

### Frontend Files (`MausamApp-Client`)
*   **`App.js`**
    *   *Topic:* **Initialization**. The absolute root of the app. It wraps the entire application in the `WeatherProvider` so data is accessible globally.
*   **`src/screens/HomeScreen.js`**
    *   *Topic:* **User Interface (UI/UX)**. The massive visual engine of the app. It handles the Location Picker Modal, the glowing hero cards, the grid layout, and the Citizen Radar voting UI.
*   **`src/context/WeatherContext.js`**
    *   *Topic:* **State Management**. Stores the "Brain" of the frontend (who the user is, what time it is, and where they are) so it doesn't get lost when the screen reloads.
*   **`src/services/api.js`**
    *   *Topic:* **Networking**. The bridge between the phone and the Python server. It contains the `fetch()` functions to talk to your FastAPI backend.

### Backend Files (`MausamApp-Server`)
*   **`main.py`**
    *   *Topic:* **Backend API & AI Orchestration**. The core server. It defines the API routes, holds the Geo-Caching logic, communicates with Groq/Llama 3, and ensures the AI outputs clean JSON.
*   **`data_fetcher.py`**
    *   *Topic:* **External Data Ingestion**. Dedicated purely to pulling raw scientific data from the outside world (Open-Meteo) and formatting it for the AI to read.

---

## 5. Prototype Focus & Pitch Defenses
Judges will ask about your technical decisions. Memorize these defenses focused purely on the hackathon constraints:

**Flaw 1: "Why are you using a list of predefined locations instead of an interactive Google Map?"**
*   *Defense:* "For this hackathon, we prioritized 100% stability and speed. Native map modules cause binary instability on standard Expo clients, which risks crashing during the demo. A highly curated micro-climate list ensures the judges experience a flawless, instant demo."

**Flaw 2: "If your backend server restarts, your Geo-Cache is completely wiped out because it's in-memory."**
*   *Defense:* "Exactly. It is a proof-of-concept cache. The goal here is to prove the *architecture* works—that we can intercept an AI request, check a store, and return it instantly to cut costs. The logic is proven; swapping an in-memory dictionary for an external store is a trivial next step."

**Flaw 3: "Why use Open-Meteo instead of official IMD data?"**
*   *Defense:* "We designed the pipeline to be Data-Agnostic. We are using Open-Meteo as a reliable proxy because we do not have internal IMD Mausamgram APIs yet. The moment IMD provides the API keys, we only have to change *one URL* in `data_fetcher.py` and the entire pipeline works identically."

---

## 6. Current Prototype Features
What the app can do *right now*:
1.  **Adaptive Persona UI**: Transforms the data context completely based on who is holding the phone (Farmer, Commuter, Parent, etc.).
2.  **Live Location Microclimates**: Pulls real weather data for specific geographic zones (Coastal, Mountain, Urban).
3.  **Time-of-Day Simulator**: Allows you to override the clock to test temporal forecasting (e.g., checking Evening conditions during the morning).
4.  **Citizen Radar**: Allows users to crowdsource local weather (e.g., reporting "Heavy Rain") to validate IMD radar.
5.  **In-Memory Geo-Caching**: Dramatically reduces AI API usage by saving and sharing responses among nearby users.
6.  **Model-Agnostic AI Integration**: Runs on Meta's ultra-fast Llama-3 model via Groq, entirely avoiding costly API lock-in.

---

## 7. Future Tools & Features (For Prototype Expansion Only)
If we were to expand this prototype for the final round of the hackathon (without building heavy production infrastructure), these are the lightweight tools we would use to simulate advanced features:

1.  **`AsyncStorage` (React Native Tool):** To simulate **Offline-First Mode**. Instead of a heavy database, we just save the last JSON response to the phone's local storage. If a farmer loses WiFi, we instantly load that saved string so the screen is never blank.
2.  **`expo-notifications` (Tool):** To simulate **Proactive Alerts**. Instead of building a complex Firebase cloud server, we can trigger a "Local Notification" that pops up on the phone after 10 seconds saying "Flash flood warning!" to prove the UI concept.
3.  **`expo-speech` (Tool):** To simulate **Audio Accessibility**. Instead of calling expensive translation APIs, this free tool uses the phone's built-in OS voice synthesizer to read the Action Cards out loud for illiterate users.
4.  **Python Plotly / Matplotlib (Tool):** To simulate **Radar Mapping**. Instead of a heavy PostGIS database, we can write a simple Python script to plot the Citizen Radar votes on a static image graph to show the judges how crowd-sourcing looks visually.
