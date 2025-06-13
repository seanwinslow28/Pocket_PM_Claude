import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TypingIndicator = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI is typing...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  text: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default TypingIndicator; 