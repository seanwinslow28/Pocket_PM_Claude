import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const [idea, setIdea] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  useEffect(() => {
    loadUserData();
    loadRecentAnalyses();
  }, []);

  const loadUserData = async () => {
    const userData = await ApiService.getCurrentUser();
    setUser(userData);
  };

  const loadRecentAnalyses = async () => {
    const history = await StorageService.getAnalysisHistory();
    setRecentAnalyses(history.slice(0, 3));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentAnalyses();
    setRefreshing(false);
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.analyzeIdea(idea.trim());
      
      if (result.success) {
        setAnalysis(result.data);
        
        await StorageService.saveAnalysis({
          idea: idea.trim(),
          analysis: result.data.analysis,
          usage: result.data.usage
        });
        
        await loadRecentAnalyses();
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !idea.trim() || loading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? colors.surface : '#ffffff', borderBottomColor: isDarkMode ? colors.border : '#e5e7eb' }]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="create" size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Pocket PM</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                From Idea → Execution → Launch
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]} activeOpacity={0.7}>
              <Ionicons name="time-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Progress Steps */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <View style={styles.progressSteps}>
              {/* Idea Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive]}>
                  <Ionicons name="bulb" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Idea</Text>
              </View>

              {/* Execution Step - Inactive */}
              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name="target" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Execution</Text>
              </View>

              {/* Launch Step - Inactive */}
              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name="rocket" size={32} color="#ffffff" />
                </View>
                <Text style={styles.stepLabel}>Launch</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Form Container */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Share Your Idea</Text>
              
              <View style={styles.form}>
                <TextInput
                  style={[
                    styles.ideaTextarea, 
                    { 
                      backgroundColor: isDarkMode ? colors.input : '#ffffff',
                      borderColor: isDarkMode ? colors.border : '#d1d5db',
                      color: isDarkMode ? colors.text : '#333333'
                    }
                  ]}
                  value={idea}
                  onChangeText={setIdea}
                  placeholder="Describe your product idea in detail... What problem does it solve? Who is it for? What makes it unique?"
                  placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                  multiline
                  textAlignVertical="top"
                  editable={!loading}
                />

                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    {
                      opacity: isButtonDisabled ? 0.5 : 1,
                      backgroundColor: isButtonDisabled ? '#fca5a5' : '#f87171'
                    }
                  ]}
                  onPress={handleAnalyze}
                  disabled={isButtonDisabled}
                  activeOpacity={isButtonDisabled ? 1 : 0.8}
                >
                  {loading ? (
                    <>
                      <Ionicons name="refresh" size={20} color="#ffffff" style={styles.rotating} />
                      <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color="#ffffff" />
                      <Text style={styles.analyzeButtonText}>Analyze Idea</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>

          {/* Analysis Results */}
          {analysis && !loading && (
            <Animatable.View animation="fadeInUp" duration={800} delay={600}>
              <View style={[styles.resultsContainer, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
                <Text style={[styles.resultsTitle, { color: isDarkMode ? colors.text : '#111827' }]}>✨ Analysis Results</Text>
                <ScrollView style={styles.analysisContent} nestedScrollEnabled>
                  <Text style={[styles.analysisText, { color: isDarkMode ? colors.text : '#333333' }]}>{analysis.analysis}</Text>
                </ScrollView>
              </View>
            </Animatable.View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
            Powered by OpenAI • Made with <Text style={styles.heart}>❤️</Text> for Product Innovators
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, // 1.5rem
    paddingVertical: 16, // 1rem
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 1rem
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: '#ef4444',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkles: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24, // 1.5rem
    fontWeight: '700',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14, // 0.875rem
    fontWeight: '400',
    fontFamily: 'System',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 0.75rem
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    maxWidth: 1024, // 64rem
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24, // 1.5rem
    paddingVertical: 48, // 3rem
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32, // 2rem
    marginBottom: 64, // 4rem
  },
  step: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12, // 0.75rem
  },
  stepActive: {
    // Active step styling
  },
  stepIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#9ca3af',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconActive: {
    backgroundColor: '#ef4444',
  },
  stepLabel: {
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: 'System',
  },
  stepLabelActive: {
    color: '#111827',
  },
  formContainer: {
    maxWidth: 512, // 32rem
    width: '100%',
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 30, // 1.875rem
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32, // 2rem
    fontFamily: 'System',
  },
  form: {
    flexDirection: 'column',
    gap: 24, // 1.5rem
  },
  ideaTextarea: {
    minHeight: 200,
    padding: 12, // 0.75rem
    fontSize: 16, // 1rem
    borderWidth: 1,
    borderRadius: 6, // 0.375rem
    fontFamily: 'System',
    lineHeight: 22,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    borderRadius: 12, // 0.75rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 16, // 1rem
  },
  rotating: {
    // Add rotation animation here if needed
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 18, // 1.125rem
    fontWeight: '500',
    fontFamily: 'System',
  },
  resultsContainer: {
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'System',
  },
  analysisContent: {
    maxHeight: 400,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System',
  },
  footer: {
    textAlign: 'center',
    paddingVertical: 32, // 2rem
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
  },
  heart: {
    color: '#ef4444',
  },
});
