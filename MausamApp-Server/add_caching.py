import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

cache_logic = """import time

# In-memory Geo-Cache (Simulating Redis/PostgreSQL for prototype)
geo_cache = {}
CACHE_EXPIRY_SECONDS = 1800  # 30 minutes

@app.post("/api/action-cards")
def generate_action_cards(context: WeatherContext):
    \"\"\"
    Generates algorithmic, AI-based human instructions based on the weather, persona, and live APIs.
    \"\"\"
    
    # Create a unique cache key: Persona + Time + Rounded Coordinates (~11km accuracy)
    rounded_lat = round(context.latitude, 2) if context.latitude else 0
    rounded_lon = round(context.longitude, 2) if context.longitude else 0
    cache_key = f"{context.persona}_{context.time_of_day}_{rounded_lat}_{rounded_lon}"
    
    # 1. GEO-CACHING CHECK
    if cache_key in geo_cache:
        cached_item = geo_cache[cache_key]
        if time.time() - cached_item["timestamp"] < CACHE_EXPIRY_SECONDS:
            print(f"\\n[CACHE HIT \u26A1] Saved 1 API call! Serving from cache for {cache_key}")
            return {"data": cached_item["data"]}
            
    print(f"\\n[CACHE MISS \u26C4] Hitting AI API for {cache_key}...")
    
    # 2. Fetch Real Data via APIs (IMD/Fallback)"""

text = re.sub(r'@app\.post\("/api/action-cards"\)\ndef generate_action_cards\(context: WeatherContext\):\n\s*"""\n\s*Generates algorithmic, AI-based human instructions based on the weather, persona, and live APIs.\n\s*"""\n\s*# 1\. Fetch Real Data via APIs \(IMD/Fallback\)', cache_logic, text)

# Now find where we return {"data": raw_json} and inject the cache saving
cache_save = """        # Save to Geo-Cache before returning
        geo_cache[cache_key] = {
            "data": raw_json,
            "timestamp": time.time()
        }
        
        return {"data": raw_json}"""
        
text = text.replace('return {"data": raw_json}', cache_save)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
