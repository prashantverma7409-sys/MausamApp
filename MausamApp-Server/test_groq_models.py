import sys
sys.stdout.reconfigure(encoding='utf-8')
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

models_to_test = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'allam-2-7b']

for model in models_to_test:
    try:
        r = client.chat.completions.create(
            messages=[{"role": "user", "content": 'Return JSON: {"action_cards":[{"title":"Test","instruction":"Working","type":"success"}]}'}],
            model=model,
            response_format={"type": "json_object"}
        )
        print(f"SUCCESS with {model}: {r.choices[0].message.content[:80]}")
        break
    except Exception as e:
        print(f"FAILED {model}: {str(e)[:100]}")
