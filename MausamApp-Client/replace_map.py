import re

with open('src/screens/HomeScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Map state and handlers with List logic
state_old = """  const [mapRegion, setMapRegion] = useState({ latitude: weatherData.latitude || 19.0760, longitude: weatherData.longitude || 72.8777, latitudeDelta: 10, longitudeDelta: 10 });
  const [tempLocation, setTempLocation] = useState(null);
  const handleMapPress = (e) => { setTempLocation(e.nativeEvent.coordinate); };
  const confirmLocation = async () => {
    if (tempLocation) {
      setIsMapVisible(false);
      let address = 'Selected Location';
      try {
        let geo = await Location.reverseGeocodeAsync({ latitude: tempLocation.latitude, longitude: tempLocation.longitude });
        if (geo && geo.length > 0) address = geo[0].city || geo[0].region || geo[0].country || 'Selected Location';
      } catch(e) {}
      setWeatherData(prev => ({ ...prev, latitude: tempLocation.latitude, longitude: tempLocation.longitude, location: address }));
    }
  };"""

state_new = """  const LOCATIONS = [
    { name: "Khed Shivapur, Pune", lat: 18.3340, lon: 73.8567, desc: "Agriculture / Farming" },
    { name: "Mumbai, Maharashtra", lat: 19.0760, lon: 72.8777, desc: "Coastal / Beachgoer" },
    { name: "New Delhi, Delhi", lat: 28.6139, lon: 77.2090, desc: "Urban / Commuter" },
    { name: "Shimla, Himachal", lat: 31.1048, lon: 77.1734, desc: "Mountain / Traveler" },
    { name: "Chennai, Tamil Nadu", lat: 13.0827, lon: 80.2707, desc: "Humid / Heat Exposure" },
    { name: "Guwahati, Assam", lat: 26.1158, lon: 91.7026, desc: "Heavy Rain / Flooding" }
  ];

  const handleSelectLocation = (loc) => {
    setIsMapVisible(false);
    setWeatherData(prev => ({ ...prev, latitude: loc.lat, longitude: loc.lon, location: loc.name }));
  };"""
text = text.replace(state_old, state_new)

# Replace Modal JSX
jsx_old = """      <Modal visible={isMapVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Drop a Pin to Analyze Region</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)}>
              <Feather name="x" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
          <MapView style={styles.map} initialRegion={mapRegion} onPress={handleMapPress} userInterfaceStyle="dark" provider="google">
            {tempLocation && <Marker coordinate={tempLocation} pinColor="#22D3EE" />}
          </MapView>
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmLocation} disabled={!tempLocation}>
            <Text style={styles.confirmBtnText}>{tempLocation ? "Analyze This Location" : "Tap anywhere on the map"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>"""

jsx_new = """      <Modal visible={isMapVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Select Analysis Region</Text>
            <TouchableOpacity onPress={() => setIsMapVisible(false)}>
              <Feather name="x" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.locationList}>
            {LOCATIONS.map((loc, idx) => (
              <TouchableOpacity key={idx} style={styles.locationListItem} onPress={() => handleSelectLocation(loc)}>
                <View style={styles.locationIconBox}>
                  <Feather name="map-pin" size={20} color="#22D3EE" />
                </View>
                <View>
                  <Text style={styles.locName}>{loc.name}</Text>
                  <Text style={styles.locDesc}>{loc.desc} Microclimate</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>"""
text = text.replace(jsx_old, jsx_new)

with open('src/screens/HomeScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
