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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const { colors, styles: themeStyles, isDarkMode } = useTheme();
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  const analysisTypes = [
    { id: 'comprehensive', name: 'Comprehensive Analysis', icon: 'analytics' },
    { id: 'market', name: 'Market Analysis', icon: 'trending-up' },
    { id: 'competitive', name: 'Competitive Analysis', icon: 'people' },
    { id: 'technical', name: 'Technical Feasibility', icon: 'construct' },
    { id: 'financial', name: 'Financial Projection', icon: 'calculator' },
  ];

  useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const loadRecentAnalyses = async () => {
    const history = await StorageService.getAnalysisHistory();
    setRecentAnalyses(history.slice(0, 5));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentAnalyses();
    setRefreshing(false);
  };

  const handleAnalyze = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.analyzeProduct({
        name: productName.trim(),
        description: productDescription.trim(),
        analysisType
      });
      
      if (result.success) {
        setAnalysis(result.data);
        
        await StorageService.saveAnalysis({
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          analysisType,
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

  const getSelectedAnalysisType = () => {
    return analysisTypes.find(type => type.id === analysisType) || analysisTypes[0];
  };

  const isButtonDisabled = !productName.trim() || !productDescription.trim() || loading;

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
                <Ionicons name="analytics" size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Product Analysis</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Deep dive into your product concept
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
              {/* Idea Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Idea</Text>
              </View>

              {/* Analysis Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive]}>
                  <Ionicons name="analytics" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Analysis</Text>
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
              <Text style={[styles.formTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Product Analysis</Text>
              
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? colors.text : '#333333' }]}>Product Name</Text>
                  <TextInput
                    style={[
                      styles.textInput, 
                      { 
                        backgroundColor: isDarkMode ? colors.input : '#ffffff',
                        borderColor: isDarkMode ? colors.border : '#d1d5db',
                        color: isDarkMode ? colors.text : '#333333'
                      }
                    ]}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Enter your product name"
                    placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? colors.text : '#333333' }]}>Product Description</Text>
                  <TextInput
                    style={[
                      styles.descriptionInput, 
                      { 
                        backgroundColor: isDarkMode ? colors.input : '#ffffff',
                        borderColor: isDarkMode ? colors.border : '#d1d5db',
                        color: isDarkMode ? colors.text : '#333333'
                      }
                    ]}
                    value={productDescription}
                    onChangeText={setProductDescription}
                    placeholder="Describe your product in detail..."
                    placeholderTextColor={isDarkMode ? colors.placeholder : '#9ca3af'}
                    multiline
                    textAlignVertical="top"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? colors.text : '#333333' }]}>Analysis Type</Text>
                  <TouchableOpacity
                    style={[
                      styles.typePicker, 
                      { 
                        backgroundColor: isDarkMode ? colors.input : '#ffffff',
                        borderColor: isDarkMode ? colors.border : '#d1d5db'
                      }
                    ]}
                    onPress={() => setShowTypePicker(true)}
                    disabled={loading}
                  >
                    <View style={styles.typePickerLeft}>
                      <Ionicons name={getSelectedAnalysisType().icon} size={20} color={isDarkMode ? colors.text : '#333333'} />
                      <Text style={[styles.typePickerText, { color: isDarkMode ? colors.text : '#333333' }]}>
                        {getSelectedAnalysisType().name}
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                  </TouchableOpacity>
                </View>

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
                      <Ionicons name="analytics" size={20} color="#ffffff" />
                      <Text style={styles.analyzeButtonText}>Analyze Product</Text>
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
                <Text style={[styles.resultsTitle, { color: isDarkMode ? colors.text : '#111827' }]}>📊 Analysis Results</Text>
                <ScrollView style={styles.analysisContent} nestedScrollEnabled>
                  <Text style={[styles.analysisText, { color: isDarkMode ? colors.text : '#333333' }]}>{analysis.analysis}</Text>
                </ScrollView>
              </View>
            </Animatable.View>
          )}

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <Animatable.View animation="fadeInUp" duration={800} delay={800}>
              <View style={[styles.recentContainer, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
                <Text style={[styles.recentTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Recent Analyses</Text>
                {recentAnalyses.map((item, index) => (
                  <View key={index} style={[styles.recentItem, { borderBottomColor: isDarkMode ? colors.border : '#f3f4f6' }]}>
                    <Text style={[styles.recentItemName, { color: isDarkMode ? colors.text : '#111827' }]}>
                      {item.productName || item.idea?.substring(0, 50) + '...'}
                    </Text>
                    <Text style={[styles.recentItemDate, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
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

      {/* Analysis Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowTypePicker(false)}
          activeOpacity={1}
        >
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Select Analysis Type</Text>
            {analysisTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.modalOption,
                  analysisType === type.id && { backgroundColor: isDarkMode ? colors.primary + '20' : '#fef2f2' }
                ]}
                onPress={() => {
                  setAnalysisType(type.id);
                  setShowTypePicker(false);
                }}
              >
                <Ionicons name={type.icon} size={24} color={analysisType === type.id ? '#ef4444' : (isDarkMode ? colors.textSecondary : '#6b7280')} />
                <Text style={[
                  styles.modalOptionText,
                  { color: analysisType === type.id ? '#ef4444' : (isDarkMode ? colors.text : '#111827') }
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  stepIconCompleted: {
    backgroundColor: '#22c55e',
  },
  stepLabel: {
    fontWeight: '500',
    color: '#9ca3af',
    fontFamily: 'System',
  },
  stepLabelActive: {
    color: '#111827',
  },
  stepLabelCompleted: {
    color: '#22c55e',
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
  inputGroup: {
    flexDirection: 'column',
    gap: 8, // 0.5rem
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  textInput: {
    padding: 12, // 0.75rem
    fontSize: 16, // 1rem
    borderWidth: 1,
    borderRadius: 6, // 0.375rem
    fontFamily: 'System',
  },
  descriptionInput: {
    padding: 12, // 0.75rem
    fontSize: 16, // 1rem
    borderWidth: 1,
    borderRadius: 6, // 0.375rem
    minHeight: 120,
    fontFamily: 'System',
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  typePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6, // 0.375rem
    padding: 12, // 0.75rem
  },
  typePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typePickerText: {
    fontSize: 16, // 1rem
    fontFamily: 'System',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // 0.5rem
    borderRadius: 12, // 0.75rem
    paddingVertical: 16, // 1rem
    paddingHorizontal: 16, // 1rem
    marginTop: 8,
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
  recentContainer: {
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'System',
  },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recentItemName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  recentItemDate: {
    fontSize: 14,
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
});
