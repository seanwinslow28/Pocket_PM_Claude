import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuickPrompts = ({ onPromptSelect }) => {
  const prompts = [
    "Analyze my idea",
    "Market research",
    "Business plan",
    "Competitor analysis"
  ];

  return (
    <View style={styles.container}>
      {prompts.map((prompt, index) => (
        <TouchableOpacity
          key={index}
          style={styles.promptButton}
          onPress={() => onPromptSelect(prompt)}
        >
          <Text style={styles.promptText}>{prompt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  promptButton: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    margin: 4,
    borderRadius: 15,
  },
  promptText: {
    fontSize: 14,
    color: '#333',
  },
});

export default QuickPrompts; 