import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const GradientText = ({ 
  children, 
  colors = ['#ff6b6b', '#4ecdc4'], 
  fontSize = 26,
  fontWeight = '700',
  style = {} 
}) => {
  // Fallback to regular gradient background if SVG fails
  const FallbackGradientText = () => (
    <View style={[{
      backgroundColor: 'transparent',
      alignItems: 'center',
    }, style]}>
      <Text style={{
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: colors[0], // Use first color as fallback
        textAlign: 'center',
        textShadowColor: colors[1],
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }}>
        {children}
      </Text>
    </View>
  );

  try {
    const textLength = children.length;
    const estimatedWidth = Math.min(textLength * (fontSize * 0.65), width - 60);
    
    return (
      <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
        <Svg 
          height={fontSize + 20} 
          width={estimatedWidth + 20}
          viewBox={`0 0 ${estimatedWidth + 20} ${fontSize + 20}`}
        >
          <Defs>
            <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors[1]} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <SvgText
            fill="url(#textGradient)"
            fontSize={fontSize}
            fontWeight={fontWeight}
            x="50%"
            y={fontSize + 5}
            textAnchor="middle"
            fontFamily="System"
            stroke="none"
          >
            {children}
          </SvgText>
        </Svg>
      </View>
    );
  } catch (error) {
    console.warn('SVG GradientText failed, using fallback:', error);
    return <FallbackGradientText />;
  }
};

export default GradientText; 