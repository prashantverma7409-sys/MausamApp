import re

with open('src/screens/HomeScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

c = """            <TouchableOpacity onPress={() => setIsMapVisible(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.locationText}>{weatherData.location || "Unknown"} <Text style={styles.pinCode}>Tap to map</Text></Text>
              <Feather name="chevron-down" size={14} color="#60A5FA" style={{marginLeft: 4}} />
            </TouchableOpacity>"""

text = re.sub(r'<Text style=\{styles\.locationText\}>Khed Shivapur, Pune <Text style=\{styles\.pinCode\}>• 412205</Text></Text>', c, text)

with open('src/screens/HomeScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
