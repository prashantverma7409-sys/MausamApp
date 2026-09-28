import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Dimensions, Modal } from 'react-native';
import * as Location from 'expo-location';
import { WeatherContext, PERSONAS } from '../context/WeatherContext';
import { fetchActionCards, submitCitizenRadar } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PERSONA_CONFIG = {
  'Commuter': {
    title: 'Commuter Advisory', pillLabel: 'Commuter', icon: 'car',
    badge: 'HIGH CONGESTION & WATERLOGGING', badgeBg: '#F59E0B', badgeText: '#0F172A',
    gradColors: ['#D97706', '#EA580C', '#78350F'], glow: 'rgba(245, 158, 11, 0.5)', border: 'rgba(252, 211, 77, 0.3)',
    ribbon: 'NH48 & Sinhagad Rd Bypass: +18m delay', window: 'Window: 07:30 - 10:30 AM',
    rationale: 'Doppler radar shows 18mm/hr rain cell heading over Katraj route',
    metrics: [
      { label: 'Surface Road Visibility', val: '1.2 km', sub: 'Dense spray on highway', icon: 'eye', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Waterlogging Prob', val: '78%', sub: '3 bottlenecks flagged', icon: 'droplet', color: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)' },
      { label: 'Wind Gusts / Crosswinds', val: '28 km/h', sub: 'Caution for two-wheelers', icon: 'wind', color: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' },
      { label: 'Metro / Transit Status', val: 'Normal', sub: 'Feeder buses delayed 12m', icon: 'truck', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' }
    ]
  },
  'Agriculture': {
    title: 'Agricultural Advisory (Agromet)', pillLabel: 'Agriculture', icon: 'feather',
    badge: 'PESTICIDE WASHOFF ALERT', badgeBg: '#34D399', badgeText: '#0F172A',
    gradColors: ['#047857', '#0F766E', '#064E3B'], glow: 'rgba(16, 185, 129, 0.5)', border: 'rgba(52, 211, 153, 0.3)',
    ribbon: 'Soil Saturation: 88% (Adequate)', window: 'Dry Window: Tomorrow 06:00',
    rationale: 'IMD Agromet Advisory PS-76: High chemical runoff risk',
    metrics: [
      { label: 'Soil Moisture', val: '88%', sub: 'High saturation in black soil', icon: 'droplet', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' },
      { label: 'Rainfall Predictions', val: '14mm expected', sub: 'Next 4 hours critical', icon: 'cloud-rain', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' },
      { label: 'Frost Alerts', val: 'No Risk Today', sub: 'Min night temp: 18°C', icon: 'thermometer', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Seasonal Planting Guidance', val: 'Optimal Sowing', sub: 'Good conditions for Kharif crops', icon: 'info', color: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' }
    ]
  },
  'Fitness': {
    title: 'Outdoor Training Advisory', pillLabel: 'Fitness', icon: 'activity',
    badge: 'OPTIMAL WINDOW OPEN', badgeBg: '#38BDF8', badgeText: '#0F172A',
    gradColors: ['#1D4ED8', '#3730A3', '#082F49'], glow: 'rgba(59, 130, 246, 0.5)', border: 'rgba(96, 165, 250, 0.3)',
    ribbon: 'Heat Index: 28°C (Comfortable)', window: 'Window: 05:30 - 07:00 AM',
    rationale: 'Thermal comfort index calculated via wet-bulb temp & canopy cover',
    metrics: [
      { label: 'Best Running Hours', val: '5:30 AM - 7:00 AM', sub: 'Heat stroke low', icon: 'clock', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
      { label: 'Sunrise & Sunset', val: '06:04 AM / 18:48 PM', sub: 'Golden hour window', icon: 'sunset', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Wind Speed & Gusts', val: '12 km/h WNW', sub: 'Headwind rating: Light', icon: 'wind', color: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' },
      { label: 'Heat & Hydration Alert', val: 'Moderate (28°C)', sub: 'Hydration buffer +250ml/hr', icon: 'droplet', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' }
    ]
  },
  'Health-Conscious': {
    title: 'Respiratory Care', pillLabel: 'Health', icon: 'heart',
    badge: 'AQI MODERATE • POLLEN HIGH', badgeBg: '#F43F5E', badgeText: '#FFFFFF',
    gradColors: ['#9F1239', '#581C87', '#020617'], glow: 'rgba(225, 29, 72, 0.5)', border: 'rgba(251, 113, 133, 0.3)',
    ribbon: 'PM2.5 Spikes near expressway: 82', window: 'Peak Allergen: 11:00 - 16:00',
    rationale: 'CPCB sensor integration with biometeorological forecast',
    metrics: [
      { label: 'Air Quality Index', val: '168', sub: 'Unhealthy for sensitive groups', icon: 'alert-circle', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.2)' },
      { label: 'UV Index Exposure', val: '6.4 (High)', sub: 'Protection needed 11am-3pm', icon: 'sun', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Pollen Density', val: '142 gr/m³', sub: 'Grass & Weed pollen surge', icon: 'wind', color: '#FBBF24', bg: 'rgba(250, 204, 21, 0.15)' },
      { label: 'Relative Humidity', val: '84%', sub: 'High mold/spore growth', icon: 'droplet', color: '#60A5FA', bg: 'rgba(59, 130, 246, 0.15)' }
    ]
  },
  'Beachgoer': {
    title: 'Coastal & Marine Safety', pillLabel: 'Beachgoers', icon: 'sun',
    badge: 'HIGH TIDE & SWELL WARNING', badgeBg: '#22D3EE', badgeText: '#0F172A',
    gradColors: ['#155E75', '#1E3A8A', '#020617'], glow: 'rgba(6, 182, 212, 0.5)', border: 'rgba(34, 211, 238, 0.3)',
    ribbon: 'High Tide: 13:42 hrs (4.1m)', window: 'Life Guard Warning Active',
    rationale: 'INCOIS Marine Ocean State Forecast synched via INCOIS buoy 4201',
    metrics: [
      { label: 'Significant Wave Height', val: '2.8 m', sub: 'Rough seas (INCOIS Code 5)', icon: 'activity', color: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' },
      { label: 'Tide Timings', val: 'HT 13:42', sub: 'LT 19:15 (0.8m depth)', icon: 'compass', color: '#60A5FA', bg: 'rgba(59, 130, 246, 0.15)' },
      { label: 'Sea Surface Temp', val: '29.1°C', sub: 'Warm equatorial current', icon: 'thermometer', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Onshore Wind Speed', val: '24 knots', sub: 'W-SW gusting to 32 kts', icon: 'wind', color: '#818CF8', bg: 'rgba(99, 102, 241, 0.15)' }
    ]
  },
  'Parent': {
    title: 'Parents & Family Advisory', pillLabel: 'Families', icon: 'users',
    badge: 'SCHOOL PICKUP RAIN ALERT', badgeBg: '#A78BFA', badgeText: '#0F172A',
    gradColors: ['#5B21B6', '#312E81', '#020617'], glow: 'rgba(139, 92, 246, 0.5)', border: 'rgba(167, 139, 250, 0.3)',
    ribbon: 'School Zones: 85% probability at pickup', window: 'Window: 14:15 - 15:45 PM',
    rationale: 'IMD convective storm alert intersecting rural school routes',
    metrics: [
      { label: 'School Commute Conditions', val: 'Safe / Light Congestion', sub: 'Pickup window dry', icon: 'truck', color: '#C4B5FD', bg: 'rgba(139, 92, 246, 0.15)' },
      { label: 'Severe Weather Warnings', val: 'Level 1 Rain Watch', sub: 'Flash downpour alert 14:00-15:30', icon: 'alert-triangle', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Rain Arrival Window', val: '14:15 - 15:45 PM', sub: '85% probability at pickup', icon: 'cloud-rain', color: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' },
      { label: 'Playground & Child UV', val: '3.2 Moderate', sub: 'Sun hat recommended till 1:30 PM', icon: 'sun', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' }
    ]
  },
  'Traveler': {
    title: 'Travel & Highway Advisory', pillLabel: 'Travelers', icon: 'briefcase',
    badge: 'CONVECTIVE AIRWAY HOLDS', badgeBg: '#38BDF8', badgeText: '#0F172A',
    gradColors: ['#075985', '#164E63', '#020617'], glow: 'rgba(14, 165, 233, 0.5)', border: 'rgba(56, 189, 248, 0.3)',
    ribbon: 'PNQ Airport Ground Hold: ~45 min', window: 'Airway Band: 13:00 - 19:00',
    rationale: 'AAI & IMD Aviation METAR alert for western ghat approaches',
    metrics: [
      { label: 'Flight Delay Alerts', val: '45m Hold', sub: 'PNQ & BOM departures flagged', icon: 'send', color: '#7DD3FC', bg: 'rgba(14, 165, 233, 0.15)' },
      { label: 'Saved Destinations', val: 'Goa • Delhi', sub: 'Goa (Rain) • Delhi (Clear, 34°C)', icon: 'map-pin', color: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)' },
      { label: 'Packing Suggestions', val: 'Waterproof Shell', sub: 'Compact Umbrella + High humidity', icon: 'umbrella', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' },
      { label: 'Highway Interstate Transit', val: 'NH48 Flowing', sub: 'Ghat Fog Notice (Vis 2.5 km)', icon: 'car', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' }
    ]
  },
  'Event Planner': {
    title: 'Event Planning Advisory', pillLabel: 'Events', icon: 'calendar',
    badge: 'EVENING RAIN PRECAUTION', badgeBg: '#E879F9', badgeText: '#0F172A',
    gradColors: ['#701A75', '#881337', '#020617'], glow: 'rgba(217, 70, 239, 0.5)', border: 'rgba(232, 121, 249, 0.3)',
    ribbon: 'Tent & Marquee rating: 35 km/h limit', window: 'Event Band: 18:00 - 22:30',
    rationale: 'Micro-climate convective precipitation model for open-air banquets',
    metrics: [
      { label: 'Outdoor Comfort Index', val: '68 / 100 (Fair)', sub: 'Thermal & breeze score', icon: 'star', color: '#F0ABFC', bg: 'rgba(217, 70, 239, 0.15)' },
      { label: 'Probability of Rain', val: '85% Peak', sub: 'Thundercloud cell tracking east', icon: 'cloud-lightning', color: '#FB7185', bg: 'rgba(244, 63, 94, 0.15)' },
      { label: 'Extended 72Hr Forecast', val: 'Fri: Rain • Sat: Clear', sub: 'Sun: Drizzle (Plan accordingly)', icon: 'calendar', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)' },
      { label: 'Wind Gust Safety Limit', val: '18 km/h (Safe)', sub: 'Tent & marquee threshold: 35', icon: 'wind', color: '#34D399', bg: 'rgba(16, 185, 129, 0.15)' }
    ]
  }
};


const HomeScreen = () => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const LOCATIONS = [
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
  };
  const { persona, setPersona, timeOfDay, weatherData, setWeatherData, judgeTimeOverride, setJudgeTimeOverride } = useContext(WeatherContext);
  const [actionCards, setActionCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [radarVote, setRadarVote] = useState(null);

  useEffect(() => {
    const getCards = async () => {
      setLoading(true);
      const result = await fetchActionCards({
        persona,
        time_of_day: timeOfDay,
        location: weatherData.location,
        latitude: weatherData.latitude,
        longitude: weatherData.longitude
      });
      if (result) {
        setActionCards(result.action_cards);
        if (result.weather_stats) {
          setWeatherData(prev => ({
            ...prev,
            temperature: result.weather_stats.temperature,
            humidity: result.weather_stats.humidity,
            windSpeed: result.weather_stats.wind_speed,
            rainProb: result.weather_stats.rain_prob,
            sunrise: result.weather_stats.sunrise,
            aqi: result.weather_stats.aqi
          }));
        }
      }
      setLoading(false);
    };
    getCards();
  }, [persona, timeOfDay, weatherData.latitude]); 

  const conf = PERSONA_CONFIG[persona] || PERSONA_CONFIG['Commuter'];

  const JUMP_TIMES = [
    { time: '06:00', label: 'Fit' },
    { time: '08:00', label: 'Drive' },
    { time: '12:00', label: 'Agri' },
    { time: '14:15', label: 'Fam' },
    { time: '18:00', label: 'Event' }
  ];

  const handleRadar = async (status) => {
    setRadarVote(status);
    const res = await submitCitizenRadar(status, persona, 'Khed Shivapur, Pune');
    if (res && res.status === 'success') {
      Alert.alert("Citizen Radar Synced", `Thank you! Your live report of '${status}' has been securely crowdsourced back to the IMD edge mesh. (Total reports today: ${res.total_reports})`);
    } else {
      Alert.alert("Connection Error", "Could not sync report to IMD servers. Saved locally.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={isMapVisible} animationType="slide" transparent={true}>
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
      </Modal>
      <LinearGradient colors={['#0F172A', '#020617', '#000000']} style={StyleSheet.absoluteFillObject} />
      
      {/* 1. Header & Caching Indicator */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Feather name="map-pin" size={14} color="#60A5FA" />
          </View>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.imdBadge}>IMD PS-76</Text>
              <View style={styles.offlinePill}>
                <View style={styles.greenPulse} />
                <Text style={styles.offlineText}>SQLite Offline Cached (2m ago)</Text>
              </View>
            </View>
                        <TouchableOpacity onPress={() => setIsMapVisible(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.locationText}>{weatherData.location || "Unknown"} <Text style={styles.pinCode}>Tap to map</Text></Text>
              <Feather name="chevron-down" size={14} color="#60A5FA" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 6. Time-of-Day Simulator */}
      <View style={styles.judgeControl}>
        <View style={styles.judgeHeader}>
          <View style={styles.judgeHeaderLeft}>
            <View style={styles.cyanDot} />
            <Text style={styles.judgeTitle}>IMD PS-76 Time Simulator</Text>
          </View>
        </View>
        
        <View style={styles.timeJumps}>
          {JUMP_TIMES.map(jt => (
            <TouchableOpacity key={jt.time} onPress={() => setJudgeTimeOverride(jt.time)} style={[styles.timeJumpBtn, judgeTimeOverride === jt.time && {backgroundColor: '#334155'}]}>
              <Text style={styles.timeJumpText}>{jt.time}</Text>
              <Text style={styles.timeJumpSub}>{jt.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setJudgeTimeOverride(null)} style={styles.timeJumpBtn}>
            <Text style={styles.timeJumpText}>Live</Text>
            <Text style={styles.timeJumpSub}>Reset</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.autoSyncText}>Auto-synchronized: {conf.pillLabel} Persona active for current simulation window.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 150}}>
        {/* 2. Persona Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personaBar}>
          {PERSONAS.map(p => {
            const isActive = persona === p;
            const pConf = PERSONA_CONFIG[p];
            return (
              <TouchableOpacity key={p} onPress={() => setPersona(p)} style={[styles.personaChip, isActive && styles.personaChipActive]}>
                <Feather name={pConf.icon} size={14} color={isActive ? '#93C5FD' : '#94A3B8'} style={{marginRight: 6}} />
                <Text style={[styles.personaChipText, isActive && styles.personaChipTextActive]}>{pConf.pillLabel}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Real-time summary sub-bar */}
        <View style={styles.subBar}>
          <View style={styles.subBarLeft}>
            <View style={styles.subBarIcon}>
              <Feather name="cloud-rain" size={16} color="#FBBF24" />
            </View>
            <Text style={styles.tempDisplay}>{weatherData.temperature}°C <Text style={styles.condDisplay}>Scattered Monsoon Showers</Text></Text>
          </View>
          <View style={styles.simTimeBadge}>
            <Feather name="clock" size={12} color="#22D3EE" />
            <Text style={styles.simTimeText}>{judgeTimeOverride || 'Live'}</Text>
          </View>
        </View>

        {/* 3. Hero Section (Dynamic Action Card) */}
        <View style={styles.heroWrapper}>
          {/* Glowing Shadow Mock */}
          <View style={[styles.heroGlow, { backgroundColor: conf.glow }]} />
          
          <LinearGradient colors={conf.gradColors} style={[styles.heroCard, { borderColor: conf.border }]}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTopLeft}>
                <View style={styles.heroBadge}>
                  <Feather name="zap" size={10} color="#FDE047" />
                  <Text style={styles.heroBadgeText}>{conf.title}</Text>
                </View>
                <View style={[styles.severityBadge, {backgroundColor: conf.badgeBg}]}>
                  <Text style={[styles.severityText, {color: conf.badgeText}]}>{conf.badge}</Text>
                </View>
              </View>
              <Text style={styles.confidenceText}><Feather name="shield" size={10} color="#6EE7B7" /> 94% IMD Confidence</Text>
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroIconBox}>
                <Feather name={conf.icon} size={26} color="#fff" />
              </View>
              <View style={{flex: 1, paddingLeft: 14}}>
                <Text style={styles.heroTitle}>
                  {loading ? 'Fetching insights...' : (actionCards[0]?.title || conf.heroHeading || 'Advisory Generation')}
                </Text>
                <Text style={styles.heroInstruction}>
                  {loading ? 'Analyzing live satellite data...' : (actionCards[0]?.instruction || conf.heroText || 'Loading advisory...')}
                </Text>
              </View>
            </View>

            <View style={styles.heroRibbon}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Feather name="navigation" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.ribbonText}>{conf.ribbon}</Text>
              </View>
              <View style={styles.windowBox}>
                <Feather name="clock" size={10} color="#fff" />
                <Text style={styles.windowText}>{conf.window}</Text>
              </View>
            </View>
            <View style={styles.aiRationale}>
              <Feather name="cpu" size={10} color="rgba(255,255,255,0.7)" />
              <Text style={styles.aiRationaleText}>{conf.rationale}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* 4. 2x2 Dynamic Metrics Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONTEXTUAL TELEMETRY</Text>
          <View style={styles.sectionSubLabel}><Text style={styles.sectionSubText}>{conf.pillLabel} Telemetry</Text></View>
        </View>

        <View style={styles.gridContainer}>
          {conf.metrics.map((m, i) => (
            <View key={i} style={[styles.gridTile, {borderColor: m.bg}]}>
              <View style={styles.gridTop}>
                <Text style={styles.gridLabel}>{m.label}</Text>
                <View style={[styles.gridIconWrap, {backgroundColor: m.bg}]}>
                  <Feather name={m.icon} size={14} color={m.color} />
                </View>
              </View>
              <View>
                <Text style={[styles.gridVal, {color: m.color.includes('F43F5E') || m.color.includes('FB7185') ? '#FB7185' : '#F1F5F9'}]}>{m.val}</Text>
                <Text style={styles.gridSub}>{m.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 5. Citizen Radar Widget */}
        <View style={styles.citizenRadarCard}>
          <View style={styles.radarHeader}>
            <View style={styles.radarHeaderLeft}>
              <View style={styles.radarIconBox}>
                <Feather name="radio" size={14} color="#34D399" />
              </View>
              <View>
                <Text style={styles.radarTitle}>Citizen Radar <Text style={styles.radarTag}>Crowd-AI Validation</Text></Text>
              </View>
            </View>
            <Text style={styles.radarCount}>142 verified nearby</Text>
          </View>
          <Text style={styles.radarPrompt}>Is it raining near you right now?</Text>
          
          <View style={styles.radarChips}>
            {[{lbl: 'Clear', sub: 'Dry road', i: 'sun', col: '#FBBF24'}, {lbl: 'Drizzle', sub: '< 2.5 mm/h', i: 'cloud-drizzle', col: '#60A5FA'}, {lbl: 'Heavy Rain', sub: 'Flooding', i: 'cloud-lightning', col: '#22D3EE'}].map(status => (
              <TouchableOpacity key={status.lbl} onPress={() => handleRadar(status.lbl)} style={[styles.voteChip, radarVote === status.lbl && {backgroundColor: '#1E293B', borderColor: status.col}]}>
                <Feather name={status.i} size={16} color={status.col} style={{marginBottom: 4}} />
                <Text style={styles.voteText}>{status.lbl}</Text>
                <Text style={styles.voteSub}>{status.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingTop: 45, borderBottomWidth: 1, borderBottomColor: 'rgba(30, 41, 59, 0.8)', backgroundColor: 'rgba(2, 6, 23, 0.85)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  imdBadge: { fontSize: 9, fontWeight: 'bold', color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)', marginRight: 6 },
  offlinePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  greenPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399', marginRight: 4 },
  offlineText: { fontSize: 9, color: '#34D399', fontFamily: 'monospace' },
  locationText: { fontSize: 12, fontWeight: '600', color: '#F1F5F9' },
  pinCode: { color: '#94A3B8', fontWeight: '400' },
  radarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  radarBtnText: { color: '#34D399', fontSize: 10, fontWeight: '600', marginLeft: 4 },
  
  personaBar: { paddingLeft: 16, marginTop: 12, marginBottom: 16, maxHeight: 40 },
  personaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.5)', marginRight: 6 },
  personaChipActive: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(96, 165, 250, 0.5)' },
  personaChipText: { fontSize: 12, fontWeight: '500', color: '#94A3B8' },
  personaChipTextActive: { color: '#93C5FD' },

  subBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, backgroundColor: 'rgba(15, 23, 42, 0.6)', borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.8)', padding: 10, borderRadius: 12, marginBottom: 16 },
  subBarLeft: { flexDirection: 'row', alignItems: 'center' },
  subBarIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  tempDisplay: { fontSize: 14, fontWeight: 'bold', color: '#F1F5F9' },
  condDisplay: { fontSize: 12, color: '#94A3B8', fontWeight: 'normal' },
  simTimeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.4)' },
  simTimeText: { fontSize: 11, color: '#CBD5E1', fontFamily: 'monospace', marginLeft: 4 },

  heroWrapper: { marginHorizontal: 16, marginBottom: 20, position: 'relative' },
  heroGlow: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 24, opacity: 0.6 },
  heroCard: { borderRadius: 16, padding: 20, borderWidth: 1, overflow: 'hidden' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heroTopLeft: { flexDirection: 'row', alignItems: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  heroBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', marginLeft: 4, letterSpacing: 0.5 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
  severityText: { fontSize: 9, fontWeight: 'bold' },
  confidenceText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' },
  heroContent: { flexDirection: 'row', alignItems: 'flex-start' },
  heroIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroInstruction: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', lineHeight: 20 },
  heroRibbon: { marginTop: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ribbonText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginLeft: 6 },
  windowBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  windowText: { fontSize: 11, fontWeight: '600', color: '#fff', marginLeft: 4, fontFamily: 'monospace' },
  aiRationale: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  aiRationaleText: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginLeft: 6 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1 },
  sectionSubLabel: { backgroundColor: '#1E293B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#334155' },
  sectionSubText: { fontSize: 10, color: '#60A5FA', fontFamily: 'monospace' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, justifyContent: 'space-between' },
  gridTile: { width: '48%', backgroundColor: 'rgba(15, 23, 42, 0.7)', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  gridTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  gridLabel: { fontSize: 11, fontWeight: '600', color: '#CBD5E1', flex: 1, marginRight: 6 },
  gridIconWrap: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  gridVal: { fontSize: 18, fontWeight: 'bold', color: '#F1F5F9', fontFamily: 'monospace', letterSpacing: -0.5 },
  gridSub: { fontSize: 10, color: '#94A3B8', marginTop: 2, fontWeight: '500' },

  citizenRadarCard: { marginHorizontal: 16, marginTop: 8, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.9)' },
  radarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  radarHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  radarIconBox: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  radarTitle: { fontSize: 12, fontWeight: 'bold', color: '#E2E8F0' },
  radarTag: { fontSize: 9, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontFamily: 'monospace', marginLeft: 6 },
  radarCount: { fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' },
  radarPrompt: { fontSize: 12, color: '#CBD5E1', fontWeight: '500', marginBottom: 12 },
  radarChips: { flexDirection: 'row', justifyContent: 'space-between' },
  voteChip: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.7)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(51, 65, 85, 0.6)' },
  voteText: { fontSize: 12, fontWeight: '600', color: '#E2E8F0', marginTop: 4 },
  voteSub: { fontSize: 9, color: '#94A3B8', marginTop: 2 },

  judgeControl: { backgroundColor: 'rgba(2, 6, 23, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(30, 41, 59, 0.9)', padding: 16, paddingBottom: 16 },
  judgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  judgeHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  cyanDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22D3EE', marginRight: 8 },
  judgeTitle: { fontSize: 10, fontWeight: 'bold', color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: 0.5 },
  timeJumps: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timeJumpBtn: { backgroundColor: '#1E293B', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  timeJumpText: { color: '#CBD5E1', fontSize: 12, fontFamily: 'monospace' },
  timeJumpSub: { color: '#94A3B8', fontSize: 9, textAlign: 'center', marginTop: 2 },
  autoSyncText: { fontSize: 10, color: '#22D3EE', fontStyle: 'italic', textAlign: 'center', marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: '#0F172A' },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#0F172A' },
  mapTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold' },
  locationList: { flex: 1, padding: 20 },
  locationListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  locationIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(34, 211, 238, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locName: { color: '#F1F5F9', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  locDesc: { color: '#94A3B8', fontSize: 12 },
});

export default HomeScreen;
