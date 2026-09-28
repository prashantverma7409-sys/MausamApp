import os
import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace imports
text = text.replace("from google import genai\\nfrom google.genai import types", "from groq import Groq")
text = text.replace("from google import genai\\r\\nfrom google.genai import types", "from groq import Groq")
text = text.replace("from google import genai\nfrom google.genai import types", "from groq import Groq")
text = text.replace("from google.genai import types", "")
text = text.replace("from google import genai", "from groq import Groq")


# Replace Client Init
text = re.sub(r'API_KEY\s*=\s*os\.environ\.get\("GEMINI_API_KEY"\).*?client\s*=\s*genai\.Client\(api_key=API_KEY\)', 
              '''GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY missing")

groq_client = Groq(api_key=GROQ_API_KEY)''', text, flags=re.DOTALL)

# Replace AI Call
text = re.sub(r'response\s*=\s*client\.models\.generate_content\(.*?raw_json\s*=\s*json\.loads\(response\.text\)', 
              '''response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        raw_json = json.loads(response.choices[0].message.content)''', text, flags=re.DOTALL)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
