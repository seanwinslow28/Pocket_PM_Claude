import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Share,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/api';
import StorageService from '../utils/storage';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { colors, styles: themeStyles, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [analysisStats, setAnalysisStats] = useState({
    total: 0,
    thisMonth: 0,
    businessAnalyses: 0,
    marketAnalyses: 0,
    technicalAnalyses: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [favoriteAnalyses, setFavoriteAnalyses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    thisMonth: 0,
    thisWeek: 0,
    avgPerWeek: 0
  });

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    getProfile();
    getAnalysisStats();
    getFavoriteAnalyses();
    getMonthlyChartData();
    loadStats();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              display_name: user.email.split('@')[0],
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!createError) {
            setProfile(newProfile);
            setDisplayName(newProfile.display_name || '');
            setCompany(newProfile.company || '');
            setRole(newProfile.role || '');
          }
        } else if (!error) {
          setProfile(data);
          setDisplayName(data.display_name || '');
          setCompany(data.company || '');
          setRole(data.role || '');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: allAnalyses } = await supabase
          .from('product_analyses')
          .select('analysis_type, created_at')
          .eq('user_id', user.id);

        if (allAnalyses) {
          const total = allAnalyses.length;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const thisMonth = allAnalyses.filter(analysis => {
            const date = new Date(analysis.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          }).length;

          const businessAnalyses = allAnalyses.filter(a => a.analysis_type === 'business').length;
          const marketAnalyses = allAnalyses.filter(a => a.analysis_type === 'market').length;
          const technicalAnalyses = allAnalyses.filter(a => a.analysis_type === 'technical').length;

          setAnalysisStats({
            total,
            thisMonth,
            businessAnalyses,
            marketAnalyses,
            technicalAnalyses
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
    }
  };

  const getMonthlyChartData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: analyses } = await supabase
          .from('product_analyses')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (analyses) {
          const monthlyStats = {};
          const last6Months = [];
          
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const label = date.toLocaleDateString('en-US', { month: 'short' });
            last6Months.push({ key, label, count: 0 });
            monthlyStats[key] = 0;
          }

          analyses.forEach(analysis => {
            const date = new Date(analysis.created_at);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyStats.hasOwnProperty(key)) {
              monthlyStats[key]++;
            }
          });

          const chartData = last6Months.map(month => ({
            ...month,
            count: monthlyStats[month.key]
          }));

          setMonthlyData(chartData);
        }
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const getFavoriteAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('product_analyses')
          .select('id, product_name, analysis_type, created_at')
          .eq('user_id', user.id)
          .eq('is_favorite', true)
          .order('created_at', { ascending: false })
          .limit(5);

        setFavoriteAnalyses(data || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (analysisId, isFavorite) => {
    try {
      const { error } = await supabase
        .from('product_analyses')
        .update({ is_favorite: !isFavorite })
        .eq('id', analysisId);

      if (!error) {
        getFavoriteAnalyses();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const exportAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: analyses } = await supabase
          .from('product_analyses')
          .select('product_name, analysis_type, created_at, ai_analysis')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (analyses && analyses.length > 0) {
          let exportText = `📊 AI Product Analysis Export\n`;
          exportText += `User: ${user.email}\n`;
          exportText += `Export Date: ${new Date().toLocaleDateString()}\n`;
          exportText += `Total Analyses: ${analyses.length}\n\n`;

          analyses.forEach((analysis, index) => {
            exportText += `--- Analysis ${index + 1} ---\n`;
            exportText += `Product: ${analysis.product_name}\n`;
            exportText += `Type: ${analysis.analysis_type}\n`;
            exportText += `Date: ${new Date(analysis.created_at).toLocaleDateString()}\n\n`;
            exportText += `Analysis:\n${analysis.ai_analysis?.content || 'No content'}\n\n`;
          });

          await Share.share({
            message: exportText,
            title: 'My Product Analyses'
          });
        } else {
          Alert.alert('No Data', 'You have no analyses to export yet.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export analyses');
      console.error('Export error:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          company: company,
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile({
        ...profile,
        display_name: displayName,
        company: company,
        role: role
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.signOut();
              // Navigate to auth screen or handle sign out
            } catch (error) {
              console.error('Sign out failed:', error);
            }
          }
        }
      ]
    );
  };

  const loadStats = async () => {
    const history = await StorageService.getAnalysisHistory();
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeek = history.filter(item => 
      new Date(item.timestamp) >= startOfWeek
    ).length;

    const thisMonth = history.filter(item => 
      new Date(item.timestamp) >= startOfMonth
    ).length;

    setStats({
      totalAnalyses: history.length,
      thisMonth,
      thisWeek,
      avgPerWeek: Math.round(history.length / 4) // Approximate
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getProfile();
    await getAnalysisStats();
    await getFavoriteAnalyses();
    await getMonthlyChartData();
    await loadStats();
    setRefreshing(false);
  };

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.count));
    const chartHeight = 120;

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, themeStyles.text]}>📈 Monthly Analysis Trend</Text>
        <View style={styles.chart}>
          {data.map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: maxValue > 0 ? (item.count / maxValue) * chartHeight : 0,
                      backgroundColor: item.count > 0 ? colors.primary : colors.border
                    }
                  ]}
                />
                <Text style={[styles.barValue, { color: colors.primary }]}>{item.count}</Text>
              </View>
              <Text style={[styles.barLabel, themeStyles.textSecondary]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, themeStyles.container]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, themeStyles.text]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themeStyles.container, { backgroundColor: isDarkMode ? colors.background : '#f8f9fa' }]}>
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
                <Ionicons name="person" size={24} color="#ffffff" />
                <View style={styles.sparkles}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDarkMode ? colors.text : '#111827' }]}>Profile</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                Your product journey dashboard
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'transparent' : 'transparent' }]} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
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

              {/* Analysis Step - Completed */}
              <View style={styles.step}>
                <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                  <Ionicons name="checkmark" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Analysis</Text>
              </View>

              {/* Launch Step - Active */}
              <View style={[styles.step, styles.stepActive]}>
                <View style={[styles.stepIcon, styles.stepIconActive]}>
                  <Ionicons name="rocket" size={32} color="#ffffff" />
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Launch</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Profile Card */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <View style={[styles.profileCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: isDarkMode ? colors.primary : '#ef4444' }]}>
                    <Text style={styles.avatarText}>
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: isDarkMode ? colors.text : '#111827' }]}>
                    {user?.email || 'Product Manager'}
                  </Text>
                  <Text style={[styles.profileRole, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>
                    Innovation Explorer
                  </Text>
                </View>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                  <Ionicons name="create-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>

          {/* Analytics Overview */}
          <Animatable.View animation="fadeInUp" duration={800} delay={600}>
            <View style={[styles.analyticsCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Analytics Overview</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDarkMode ? colors.text : '#111827' }]}>{stats.totalAnalyses}</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>Total Analyses</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDarkMode ? colors.text : '#111827' }]}>{stats.thisMonth}</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>This Month</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDarkMode ? colors.text : '#111827' }]}>{stats.thisWeek}</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>This Week</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: isDarkMode ? colors.text : '#111827' }]}>{stats.avgPerWeek}</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? colors.textSecondary : '#6b7280' }]}>Avg/Week</Text>
                </View>
              </View>
            </View>
          </Animatable.View>

          {/* Settings */}
          <Animatable.View animation="fadeInUp" duration={800} delay={800}>
            <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? colors.surface : '#ffffff' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? colors.text : '#111827' }]}>Settings</Text>
              
              <View style={styles.settingsList}>
                <TouchableOpacity style={styles.settingItem} onPress={toggleTheme} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
                    <Text style={[styles.settingText, { color: isDarkMode ? colors.text : '#333333' }]}>
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={exportAnalyses} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="download-outline" size={20} color={isDarkMode ? colors.textSecondary : '#6b7280'} />
                    <Text style={[styles.settingText, { color: isDarkMode ? colors.text : '#333333' }]}>Export Data</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem} onPress={handleSignOut} activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={[styles.settingText, { color: '#ef4444' }]}>Sign Out</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? colors.textSecondary : '#9ca3af'} />
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  profileCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24, // 1.5rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 1rem
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'System',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  profileRole: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24, // 1.5rem
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'System',
    textAlign: 'center',
  },
  settingsCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsList: {
    gap: 8, // 0.5rem
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16, // 1rem
    paddingHorizontal: 12, // 0.75rem
    borderRadius: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 0.75rem
  },
  settingText: {
    fontSize: 16, // 1rem
    fontWeight: '500',
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

export default ProfileScreen;
