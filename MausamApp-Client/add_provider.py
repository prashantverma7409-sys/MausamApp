import re

with open('src/screens/HomeScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('userInterfaceStyle="dark"', 'userInterfaceStyle="dark" provider="google"')

with open('src/screens/HomeScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
