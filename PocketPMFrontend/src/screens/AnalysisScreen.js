import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../utils/storage';

const { width, height } = Dimensions.get('window');

export default function AnalysisScreen({ navigation, route }) {
  const { idea: routeIdea, analysis: routeAnalysis, usage: routeUsage } = route.params || {};
  
  const [idea, setIdea] = useState(routeIdea);
  const [analysis, setAnalysis] = useState(routeAnalysis);
  const [usage, setUsage] = useState(routeUsage);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Extract product name from idea for display
  const getProductName = (ideaText) => {
    if (!ideaText) return 'Your Product';
    const ideaParts = ideaText.split(':');
    if (ideaParts.length > 1) {
      return ideaParts[0].trim();
    }
    const words = ideaText.trim().split(' ');
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  };

  const productName = getProductName(idea);

  useEffect(() => {
    // Start entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Logo glow animation
    const logoAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    logoAnimation.start();

    // Floating shapes animation
    floatingShapes.forEach((anim, index) => {
      const floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      );
      setTimeout(() => floatingAnimation.start(), index * 2000);
    });

    // Load missing data if needed
    const loadMissingData = async () => {
      if (!idea || !analysis) {
        setLoading(true);
        try {
          const history = await StorageService.getAnalysisHistory();
          if (history && history.length > 0) {
            const latest = history[0];
            setIdea(latest.idea);
            setAnalysis(latest.analysis);
            setUsage(latest.usage);
          }
        } catch (error) {
          console.error('Failed to load from storage:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadMissingData();

    return () => {
      logoAnimation.stop();
      floatingShapes.forEach(anim => anim.stopAnimation());
    };
  }, []);

  const handleShare = async () => {
    try {
      const shareContent = `💡 Product Analysis\n\nIdea: ${idea}\n\nAnalysis:\n${analysis}\n\nAnalyzed with Pocket PM`;
      await Share.share({
        message: shareContent,
        title: 'My Product Analysis'
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleNewAnalysis = () => {
    navigation.navigate('HomeMain');
  };

  const handleLaunch = () => {
    navigation.navigate('Launch', {
      idea,
      analysis,
      usage
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your analysis...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Floating Background Elements */}
      {floatingShapes.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.floatingShape,
            {
              transform: [{
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              }, {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              }],
            },
            index === 0 && styles.floatingShape1,
            index === 1 && styles.floatingShape2,
            index === 2 && styles.floatingShape3,
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Header */}
          <BlurView intensity={20} tint="dark" style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Animated.View style={[
              styles.logo,
              {
                shadowColor: logoGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(78, 205, 196, 0.5)', 'rgba(255, 107, 107, 0.8)'],
                }),
              }
            ]}>
              <LinearGradient
                colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.logoIcon}
              >
                <Ionicons name="analytics" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.logoText}>Analysis</Text>
            </Animated.View>

            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </BlurView>

          {/* Main Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Product Title */}
            <BlurView intensity={15} tint="dark" style={styles.titleContainer}>
              <MaskedView
                style={styles.titleMaskContainer}
                maskElement={
                  <Text style={styles.titleMask}>
                    {productName}
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.titleGradient}
                />
              </MaskedView>
              <Text style={styles.subtitle}>Product Analysis</Text>
            </BlurView>

            {/* Original Idea */}
            <BlurView intensity={15} tint="dark" style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={20} color="#4ecdc4" />
                <Text style={styles.sectionTitle}>Original Idea</Text>
              </View>
              <Text style={styles.ideaText}>{idea}</Text>
            </BlurView>

            {/* Analysis Results */}
            <BlurView intensity={15} tint="dark" style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="analytics" size={20} color="#ff6b6b" />
                <Text style={styles.sectionTitle}>AI Analysis</Text>
              </View>
              <Text style={styles.analysisText}>{analysis}</Text>
            </BlurView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNewAnalysis}
              >
                <BlurView intensity={15} tint="dark" style={styles.actionButtonBlur}>
                  <Ionicons name="add-circle" size={20} color="#4ecdc4" />
                  <Text style={styles.actionButtonText}>New Analysis</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLaunch}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="rocket" size={20} color="white" />
                  <Text style={styles.actionButtonGradientText}>Launch Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  // Floating background elements
  floatingShape: {
    position: 'absolute',
    opacity: 0.1,
  },
  floatingShape1: {
    top: '15%',
    left: '10%',
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
  },
  floatingShape2: {
    top: '60%',
    right: '15%',
    width: 40,
    height: 40,
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
  },
  floatingShape3: {
    bottom: '20%',
    left: '20%',
    width: 80,
    height: 80,
    backgroundColor: '#45b7d1',
    borderRadius: 40,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Title
  titleContainer: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleMaskContainer: {
    height: 40,
    marginBottom: 8,
  },
  titleMask: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  titleGradient: {
    flex: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  // Sections
  sectionContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  ideaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  analysisText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  // Actions
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonGradientText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};
