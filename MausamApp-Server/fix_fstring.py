import re

with open('main.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('print(f"\n[CACHE HIT', 'print(f"\\n[CACHE HIT')
text = text.replace('print(f"\n[CACHE MISS', 'print(f"\\n[CACHE MISS')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed")
