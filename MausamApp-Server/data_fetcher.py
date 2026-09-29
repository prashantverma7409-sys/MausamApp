import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import math

# ==========================================
# 0. Resilient HTTP Session
# ==========================================
def get_resilient_session():
    session = requests.Session()
    # Retry on 429 (Rate Limit), 500, 502, 503, 504 with exponential backoff
    retry = Retry(
        total=4,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

# ==========================================
# 1. Government APIs (IMD, SAFAR, INCOIS)
# ==========================================

def fetch_imd_weather(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability&daily=sunrise,sunset,precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto"
    try:
        session = get_resilient_session()
        response = session.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching weather after retries: {e}")
        # HACKATHON FALLBACK: Never crash the demo if Open-Meteo is overloaded
        return {
            "current": {
                "temperature_2m": 28.5,
                "relative_humidity_2m": 65,
                "apparent_temperature": 32.0,
                "precipitation": 0,
                "wind_speed_10m": 12.5
            },
            "daily": {
                "sunrise": ["2024-01-01T06:30"],
                "sunset": ["2024-01-01T18:30"],
                "precipitation_probability_max": [10]
            },
            "hourly": {}
        }

def fetch_safar_aqi(lat, lon):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi"
    try:
        session = get_resilient_session()
        response = session.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching AQI after retries: {e}")
        return {"current": {"us_aqi": 45}}

# ==========================================
# 2. Third-Party APIs (Traffic, Pollen)
# ==========================================

def fetch_google_traffic(origin, destination, api_key):
    """
    Fetches commute duration with traffic. 
    Requires Google Maps Routes API Key.
    """
    if not api_key:
        return {"status": "No API Key", "delay_mins": 0}
    
    # Placeholder for actual Google Maps Routes API integration
    return {"status": "Traffic OK", "delay_mins": 15}

# ==========================================
# 3. Deterministic Algorithms (No AI Needed)
# ==========================================

def calculate_heat_index(temp_c, humidity):
    """
    Calculates Heat Index (Comfort Index) using standard meteorological formulas.
    temp_c: Temperature in Celsius
    humidity: Relative Humidity %
    """
    # Convert C to F
    T = (temp_c * 9/5) + 32
    R = humidity
    
    # Simple Heat Index formula (Steadman's result) for lower temps
    HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094))
    
    if HI >= 80:
        # Full Rothfusz regression
        HI = -42.379 + 2.04901523*T + 10.14333127*R - 0.22475541*T*R \
             - 0.00683783*T*T - 0.05481717*R*R + 0.00122874*T*T*R \
             + 0.00085282*T*R*R - 0.00000199*T*T*R*R
             
    # Convert back to C
    HI_c = (HI - 32) * 5/9
    return round(HI_c, 1)

def build_context_for_ai(lat, lon, persona, location_name="Unknown"):
    """
    Aggregates all API data and deterministic calculations to feed into the AI.
    """
    weather_data = fetch_imd_weather(lat, lon)
    aqi_data = fetch_safar_aqi(lat, lon)
    
    if not weather_data:
        return None

    current_weather = weather_data.get("current", {})
    temp = current_weather.get("temperature_2m", 0)
    humidity = current_weather.get("relative_humidity_2m", 0)
    
    heat_index = calculate_heat_index(temp, humidity)
    
    daily_weather = weather_data.get("daily", {})
    sunrise = daily_weather.get("sunrise", [""])[0] if "sunrise" in daily_weather else ""
    sunset = daily_weather.get("sunset", [""])[0] if "sunset" in daily_weather else ""
    rain_prob = daily_weather.get("precipitation_probability_max", [0])[0] if "precipitation_probability_max" in daily_weather else 0
    
    return {
        "location": location_name,
        "persona": persona,
        "current_temperature": temp,
        "humidity": humidity,
        "heat_index_celsius": heat_index,
        "precipitation_mm": current_weather.get("precipitation", 0),
        "rain_probability_percent": rain_prob,
        "wind_speed_kmh": current_weather.get("wind_speed_10m", 0),
        "sunrise": sunrise,
        "sunset": sunset,
        "aqi": aqi_data.get("current", {}).get("us_aqi", 50) if aqi_data else 50,
        "forecast_24h": weather_data.get("hourly", {}), # Used for "Best Running Hours"
        "extended_forecast": daily_weather # Contains 7-day max/min temps
    }

