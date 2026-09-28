from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from groq import Groq
import json

import data_fetcher
from typing import Optional

load_dotenv()

app = FastAPI(title="MausamApp API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicitly pass the Gemini API key securely from environment variables
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY missing")

groq_client = Groq(api_key=GROQ_API_KEY)
class WeatherContext(BaseModel):
    persona: str
    time_of_day: str
    location: str
    latitude: Optional[float] = 19.0760 # Default to Mumbai
    longitude: Optional[float] = 72.8777

@app.get("/")
def read_root():
    return {"status": "MausamApp AI Server is running!"}

import time

# In-memory Geo-Cache (Simulating Redis/PostgreSQL for prototype)
geo_cache = {}
CACHE_EXPIRY_SECONDS = 1800  # 30 minutes

@app.post("/api/action-cards")
def generate_action_cards(context: WeatherContext):
    """
    Generates algorithmic, AI-based human instructions based on the weather, persona, and live APIs.
    """
    
    # Create a unique cache key: Persona + Time + Rounded Coordinates (~11km accuracy)
    rounded_lat = round(context.latitude, 2) if context.latitude else 0
    rounded_lon = round(context.longitude, 2) if context.longitude else 0
    cache_key = f"{context.persona}_{context.time_of_day}_{rounded_lat}_{rounded_lon}"
    
    # 1. GEO-CACHING CHECK
    if cache_key in geo_cache:
        cached_item = geo_cache[cache_key]
        if time.time() - cached_item["timestamp"] < CACHE_EXPIRY_SECONDS:
            print(f"\n[CACHE HIT ⚡] Saved 1 API call! Serving from cache for {cache_key}")
            return {"data": cached_item["data"]}
            
    print(f"\n[CACHE MISS ⛄] Hitting AI API for {cache_key}...")
    
    # 2. Fetch Real Data via APIs (IMD/Fallback)
    real_data = data_fetcher.build_context_for_ai(
        context.latitude, 
        context.longitude, 
        context.persona, 
        context.location
    )
    
    if not real_data:
        return {"error": "Failed to fetch government/fallback API data."}
        
    # 2. Add traffic delay fallback for Commuter/Parent
    traffic_data = data_fetcher.fetch_google_traffic(None, None, None)

    # 3. Build Rules Engine Prompts based on SIH guidelines
    rules_engine_context = ""
    
    if context.persona == "Fitness":
        rules_engine_context = f"""
        - AI-Derived Insight Goal: 'Best Running Hours'
        - Task: Analyze the 24-hour weather data provided. Find the 2-hour window after sunrise where temperature is below 28°C and AQI is lowest. Return the optimal running window as one of the action cards.
        """
    elif context.persona == "Traveler":
        rules_engine_context = f"""
        - AI-Derived Insight Goal: 'Packing Suggestions'
        - Task: Based on the forecast and current conditions provided, generate exactly 3 packing suggestions (e.g., umbrella, sunscreen, light jacket) as the action cards.
        """
    elif context.persona in ["Parent", "Commuter"]:
        rules_engine_context = f"""
        - AI-Derived Insight Goal: 'School/Work Commute Conditions'
        - Task: Combine the traffic delay ({traffic_data['delay_mins']} mins) with the weather forecast. If traffic is slow and rain is present, your logic engine MUST output a specific departure warning. Example: 'Heavy rain and 15 min traffic delay. Leave early.'
        """
    else:
        rules_engine_context = "- Task: Generate standard impact-based action cards for this persona."

    # 4. Construct prompt defining the persona and current context.
    prompt = f"""
    You are an AI generating hyper-local weather Action Cards for the 'MausamApp'.
    
    User Context:
    Persona: {context.persona}
    Time of day: {context.time_of_day}
    Location: {context.location}
    
    Raw API Data (IMD/SAFAR/Calculated):
    Current Temp: {real_data['current_temperature']}°C
    Humidity: {real_data['humidity']}%
    Comfort/Heat Index: {real_data['heat_index_celsius']}°C
    Precipitation: {real_data['precipitation_mm']}mm
    Wind Speed: {real_data['wind_speed_kmh']} km/h
    AQI: {real_data['aqi']}
    
    {rules_engine_context}

    Generate 3 very short, actionable, impact-based instructions for this user.
    Do NOT just state the weather. Give them specific advice based on their persona.
    
    Output JSON in this exact format:
    {{
        "action_cards": [
            {{"title": "Short Title", "instruction": "Actionable advice here", "type": "warning|info|success"}}
        ]
    }}
    """
    
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        raw_json = json.loads(response.choices[0].message.content)
        
        # Attach the raw numerical weather stats so the UI can render them above the action cards
        raw_json["weather_stats"] = {
            "temperature": real_data['current_temperature'],
            "humidity": real_data['humidity'],
            "wind_speed": real_data['wind_speed_kmh'],
            "rain_prob": real_data['rain_probability_percent'],
            "sunrise": real_data['sunrise'],
            "aqi": real_data['aqi'],
        }
        
                # Save to Geo-Cache before returning
        geo_cache[cache_key] = {
            "data": raw_json,
            "timestamp": time.time()
        }
        
        return {"data": raw_json}
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return {"error": str(e)}

# Mock database for citizen radar
citizen_radar_db = []

@app.post("/api/citizen-radar")
async def citizen_radar(request: Request):
    try:
        data = await request.json()
        vote = data.get('vote')
        persona = data.get('persona', 'Unknown')
        location = data.get('location', 'Khed Shivapur, Pune')
        
        # Save to our "database"
        record = {
            "vote": vote,
            "persona": persona,
            "location": location,
            "timestamp": "now"
        }
        citizen_radar_db.append(record)
        print(f"[CITIZEN RADAR] {location} - {persona} reported {vote}")
        
        return {
            "status": "success", 
            "message": "Crowdsourced report verified.",
            "total_reports": len(citizen_radar_db)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
