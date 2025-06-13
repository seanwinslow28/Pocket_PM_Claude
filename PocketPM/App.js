import React from 'react';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <ChatScreen />
    </>
  );
}
