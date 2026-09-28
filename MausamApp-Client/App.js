import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { WeatherProvider } from './src/context/WeatherContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <WeatherProvider>
      <StatusBar style="auto" />
      <HomeScreen />
    </WeatherProvider>
  );
}
