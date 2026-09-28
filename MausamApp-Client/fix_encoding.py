import re

with open('src/screens/HomeScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace any malformed strings
text = re.sub(r'Alert\.alert\("Citizen Radar Synced.*?,', 'Alert.alert("Citizen Radar Synced",', text)
text = re.sub(r'\{weatherData\.temperature\}AC', '{weatherData.temperature}°C', text)

with open('src/screens/HomeScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
