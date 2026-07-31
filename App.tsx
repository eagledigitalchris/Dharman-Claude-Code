import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configurePWA } from './src/utils/pwa';

export default function App() {
  useEffect(() => {
    configurePWA();
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}
