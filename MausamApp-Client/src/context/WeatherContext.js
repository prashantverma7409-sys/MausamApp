import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
export const PERSONAS = [
  'Commuter',
  'Health-Conscious',
  'Fitness',
  'Beachgoer',
  'Traveler',
  'Parent',
  'Agriculture',
  'Event Planner'
];

export const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  
  const [weatherData, setWeatherData] = useState({
    location: 'Locating...',
    latitude: 19.0760,
    longitude: 72.8777,
    temperature: '--', // UI placeholder
    condition: '--',
    aqi: '--'
  });

  // Fetch Live Location Coordinates
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeatherData(prev => ({ ...prev, location: 'Permission Denied (Using Mumbai Default)' }));
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      // In a real app we would reverse-geocode this to get the city name
      setWeatherData({
        location: 'Current Location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        temperature: 'Live', 
        condition: 'Fetching...',
        aqi: 'Live'
      });
    })();
  }, []);

  const [judgeTimeOverride, setJudgeTimeOverride] = useState(null); // For Hackathon Demo

  // Time-of-Day Auto-Switching or Judge Override
  useEffect(() => {
    const updateTimeContext = () => {
      let hour = new Date().getHours();
      
      // Hackathon Judge Simulator Override
      if (judgeTimeOverride !== null) {
        hour = parseInt(judgeTimeOverride.split(':')[0]);
      }

      if (hour >= 5 && hour < 12) setTimeOfDay('Morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('Afternoon');
      else if (hour >= 17 && hour < 21) setTimeOfDay('Evening');
      else setTimeOfDay('Night');
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000); 
    return () => clearInterval(interval);
  }, [judgeTimeOverride]);

  return (
    <WeatherContext.Provider 
      value={{ 
        persona, 
        setPersona, 
        timeOfDay, 
        weatherData, 
        setWeatherData,
        judgeTimeOverride,
        setJudgeTimeOverride
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};
