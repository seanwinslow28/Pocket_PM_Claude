import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Snackbar,
  FAB,
  Chip,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import ApiService from '../services/api';
import StorageService from '../utils/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [idea, setIdea] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [user, setUser] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Sample idea prompts
  const sampleIdeas = [
    "An app that helps remote workers find coworking spaces",
    "A platform for sharing cooking skills between neighbors", 
    "Smart parking solution using IoT sensors",
    "AI-powered personal finance advisor for millennials",
    "Virtual reality fitness training platform"
  ];

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
    setRecentAnalyses(history.slice(0, 3)); // Show last 3
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentAnalyses();
    setRefreshing(false);
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) {
      setSnackbar({ visible: true, message: 'Please enter your product idea' });
      return;
    }

    setLoading(true);
    try {
      const result = await ApiService.analyzeIdea(idea.trim());
      
      if (result.success) {
        setAnalysis(result.data);
        
        // Save to local storage
        await StorageService.saveAnalysis({
          idea: idea.trim(),
          analysis: result.data.analysis,
          usage: result.data.usage
        });
        
        // Reload recent analyses
        await loadRecentAnalyses();
        
        setSnackbar({ visible: true, message: 'Analysis complete! 🎉' });
      } else {
        setSnackbar({ visible: true, message: result.error });
      }
    } catch (error) {
      setSnackbar({ visible: true, message: 'Analysis failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fillSampleIdea = (sampleIdea) => {
    setIdea(sampleIdea);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setIdea('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.name || 'Product Manager'}! 👋
          </Text>
          <Text style={styles.headerSubtitle}>
            What product idea would you like to analyze today?
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Input Section */}
        <Animatable.View animation="fadeInUp" duration={800}>
          <Card style={styles.inputCard}>
            <Card.Content>
              <Title style={styles.inputTitle}>🚀 Describe Your Idea</Title>
              
              <TextInput
                label="Product Idea"
                value={idea}
                onChangeText={setIdea}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.ideaInput}
                placeholder="e.g., An app that helps people find and book local experiences..."
                disabled={loading}
              />

              <Text style={styles.sampleLabel}>💡 Try these examples:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {sampleIdeas.map((sample, index) => (
                    <Chip
                      key={index}
                      mode="outlined"
                      onPress={() => fillSampleIdea(sample)}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      {sample}
                    </Chip>
                  ))}
                </View>
              </ScrollView>

              <Button
                mode="contained"
                onPress={handleAnalyze}
                style={styles.analyzeButton}
                disabled={loading || !idea.trim()}
                loading={loading}
                icon="brain"
              >
                {loading ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Analysis Results */}
        {analysis && (
          <Animatable.View animation="fadeInUp" duration={800} delay={300}>
            <Card style={styles.analysisCard}>
              <Card.Content>
                <View style={styles.analysisHeader}>
                  <Title style={styles.analysisTitle}>📊 AI Analysis</Title>
                  <Button
                    mode="text"
                    onPress={clearAnalysis}
                    compact
                    icon="close"
                  >
                    Clear
                  </Button>
                </View>
                
                <ScrollView style={styles.analysisContent}>
                  <Text style={styles.analysisText}>{analysis.analysis}</Text>
                </ScrollView>

                {analysis.usage && (
                  <View style={styles.usageInfo}>
                    <Text style={styles.usageText}>
                      💰 Tokens used: {analysis.usage.total_tokens}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <Card style={styles.recentCard}>
              <Card.Content>
                <Title style={styles.recentTitle}>📈 Recent Analyses</Title>
                {recentAnalyses.map((item, index) => (
                  <View key={item.id || index} style={styles.recentItem}>
                    <Text style={styles.recentIdea} numberOfLines={2}>
                      {item.idea}
                    </Text>
                    <Text style={styles.recentDate}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
                <Button
                  mode="text"
                  onPress={() => {/* Navigate to Analysis tab */}}
                  style={styles.viewAllButton}
                >
                  View All Analyses
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  inputTitle: {
    color: '#1E293B',
    marginBottom: 15,
  },
  ideaInput: {
    backgroundColor: '#F8FAFC',
    marginBottom: 15,
  },
  sampleLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chip: {
    marginRight: 10,
    backgroundColor: '#EEF2FF',
  },
  chipText: {
    fontSize: 12,
  },
  analyzeButton: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  analysisCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  analysisTitle: {
    color: '#1E293B',
  },
  analysisContent: {
    maxHeight: 300,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  usageInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  usageText: {
    fontSize: 12,
    color: '#0369A1',
  },
  recentCard: {
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  recentTitle: {
    color: '#1E293B',
    marginBottom: 15,
  },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  recentIdea: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  recentDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  viewAllButton: {
    marginTop: 10,
  },
  bottomSpacing: {
    height: 20,
  },
});
