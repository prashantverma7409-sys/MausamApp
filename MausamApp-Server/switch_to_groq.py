import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Gemini imports with Groq
text = text.replace("from google import genai\\nfrom google.genai import types", "from groq import Groq")
text = text.replace("from google import genai\nfrom google.genai import types", "from groq import Groq")

# Replace Client Initialization
client_init_old = \"\"\"# Explicitly pass the Gemini API key securely from environment variables
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY is not set. Please add it to your .env file.")

client = genai.Client(api_key=API_KEY)\"\"\"

client_init_new = \"\"\"# Initialize Groq for Llama 3 Inference
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set. Please add it to your .env file.")

groq_client = Groq(api_key=GROQ_API_KEY)\"\"\"
text = text.replace(client_init_old, client_init_new)

# Replace API Call
api_call_old = \"\"\"        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        raw_json = json.loads(response.text)\"\"\"

api_call_new = \"\"\"        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a meteorological AI. Always respond in pure JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        raw_json = json.loads(response.choices[0].message.content)\"\"\"
text = text.replace(api_call_old, api_call_new)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
