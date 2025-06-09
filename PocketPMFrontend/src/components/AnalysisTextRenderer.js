import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AnalysisTextRenderer = ({ content }) => {
  const { colors, isDarkMode } = useTheme();

  if (!content) return null;

  // Split content into lines and process each line
  const lines = content.split('\n');
  const renderedContent = [];
  let currentIndex = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      renderedContent.push(
        <View key={`empty-${index}`} style={styles.spacing} />
      );
      return;
    }

    // Main headers (# )
    if (trimmedLine.startsWith('# ')) {
      const text = trimmedLine.substring(2);
      renderedContent.push(
        <Text key={index} style={[styles.mainHeader, { color: isDarkMode ? colors.text : '#1a1a1a' }]}>
          {text}
        </Text>
      );
      return;
    }

    // Sub headers (## )
    if (trimmedLine.startsWith('## ')) {
      const text = trimmedLine.substring(3);
      renderedContent.push(
        <Text key={index} style={[styles.subHeader, { color: isDarkMode ? colors.text : '#2d3748' }]}>
          {text}
        </Text>
      );
      return;
    }

    // Sub-sub headers (### )
    if (trimmedLine.startsWith('### ')) {
      const text = trimmedLine.substring(4);
      renderedContent.push(
        <Text key={index} style={[styles.subSubHeader, { color: isDarkMode ? colors.text : '#4a5568' }]}>
          {text}
        </Text>
      );
      return;
    }

    // Bold text (**text**)
    if (trimmedLine.includes('**')) {
      const parts = trimmedLine.split('**');
      const textElements = parts.map((part, partIndex) => {
        if (partIndex % 2 === 1) {
          // This is bold text
          return (
            <Text key={partIndex} style={[styles.boldText, { color: isDarkMode ? colors.text : '#2d3748' }]}>
              {part}
            </Text>
          );
        }
        return part;
      });

      renderedContent.push(
        <Text key={index} style={[styles.bodyText, { color: isDarkMode ? colors.text : '#4a5568' }]}>
          {textElements}
        </Text>
      );
      return;
    }

    // Bullet points (- or *)
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2);
      renderedContent.push(
        <View key={index} style={styles.bulletContainer}>
          <Text style={[styles.bullet, { color: isDarkMode ? colors.primary : '#ef4444' }]}>•</Text>
          <Text style={[styles.bulletText, { color: isDarkMode ? colors.text : '#4a5568' }]}>
            {text}
          </Text>
        </View>
      );
      return;
    }

    // Numbered lists (1. 2. etc.)
    if (/^\d+\.\s/.test(trimmedLine)) {
      const match = trimmedLine.match(/^(\d+)\.\s(.+)$/);
      if (match) {
        const number = match[1];
        const text = match[2];
        renderedContent.push(
          <View key={index} style={styles.numberedContainer}>
            <Text style={[styles.number, { color: isDarkMode ? colors.primary : '#ef4444' }]}>
              {number}.
            </Text>
            <Text style={[styles.numberedText, { color: isDarkMode ? colors.text : '#4a5568' }]}>
              {text}
            </Text>
          </View>
        );
        return;
      }
    }

    // Code blocks or special formatting (lines starting with spaces or tabs)
    if (trimmedLine.startsWith('    ') || trimmedLine.startsWith('\t')) {
      renderedContent.push(
        <View key={index} style={[styles.codeBlock, { backgroundColor: isDarkMode ? colors.surface : '#f7fafc' }]}>
          <Text style={[styles.codeText, { color: isDarkMode ? colors.text : '#2d3748' }]}>
            {trimmedLine}
          </Text>
        </View>
      );
      return;
    }

    // Regular paragraph text
    renderedContent.push(
      <Text key={index} style={[styles.bodyText, { color: isDarkMode ? colors.text : '#4a5568' }]}>
        {trimmedLine}
      </Text>
    );
  });

  return (
    <View style={styles.container}>
      {renderedContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacing: {
    height: 12,
  },
  mainHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 32,
    fontFamily: 'System',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 28,
    fontFamily: 'System',
  },
  subSubHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: 'System',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: 'System',
  },
  boldText: {
    fontWeight: 'bold',
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 12,
  },
  bullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    fontFamily: 'System',
  },
  numberedContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 12,
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
    minWidth: 24,
  },
  numberedText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    fontFamily: 'System',
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
  },
  codeText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AnalysisTextRenderer; 