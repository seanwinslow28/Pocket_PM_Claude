import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Share,
  Dimensions,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
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

  // Animation values
  const logoGlow = useRef(new Animated.Value(0)).current;
  const floatingShapes = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProfile();
    getAnalysisStats();
    getFavoriteAnalyses();
    getMonthlyChartData();
    loadStats();

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

    return () => {
      logoAnimation.stop();
      floatingShapes.forEach(anim => anim.stopAnimation());
    };
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
      console.error('Error fetching favorite analyses:', error);
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
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (analyses && analyses.length > 0) {
          const exportData = analyses.map(analysis => ({
            product: analysis.product_name,
            type: analysis.analysis_type,
            created: new Date(analysis.created_at).toLocaleDateString(),
            analysis: analysis.analysis_result
          }));

          const csvContent = [
            'Product,Type,Created,Analysis',
            ...exportData.map(row => 
              `"${row.product}","${row.type}","${row.created}","${row.analysis.replace(/"/g, '""')}"`
            )
          ].join('\n');

          await Share.share({
            message: csvContent,
            title: 'Product Analyses Export'
          });
        } else {
          Alert.alert('No Data', 'No analyses found to export.');
        }
      }
    } catch (error) {
      console.error('Error exporting analyses:', error);
      Alert.alert('Export Failed', 'Unable to export analyses.');
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
        Alert.alert('Update Failed', error.message);
      } else {
        setIsEditing(false);
        getProfile();
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', 'Unable to update profile.');
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
              await supabase.auth.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    );
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: analyses } = await supabase
          .from('product_analyses')
          .select('created_at')
          .eq('user_id', user.id);

        if (analyses) {
          const now = new Date();
          const thisWeek = analyses.filter(a => {
            const date = new Date(a.created_at);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
          }).length;

          const thisMonth = analyses.filter(a => {
            const date = new Date(a.created_at);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).length;

          setStats({
            totalAnalyses: analyses.length,
            thisMonth,
            thisWeek,
            avgPerWeek: analyses.length > 0 ? Math.round(analyses.length / 4) : 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      getProfile(),
      getAnalysisStats(),
      getFavoriteAnalyses(),
      getMonthlyChartData(),
      loadStats()
    ]);
    setRefreshing(false);
  };

  const SimpleBarChart = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.map((item, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <View style={styles.chartBarWrapper}>
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  style={[
                    styles.chartBar,
                    { height: (item.count / maxCount) * 60 }
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
            <ActivityIndicator size="large" color="#4ecdc4" />
            <Text style={styles.loadingText}>Loading profile...</Text>
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
                <Ionicons name="person" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.logoText}>Profile</Text>
            </Animated.View>

            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </BlurView>

          {/* Main Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="white"
              />
            }
          >
            
            {/* Profile Header */}
            <BlurView intensity={15} tint="dark" style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </LinearGradient>
              </View>
              
              {isEditing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Display Name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <TextInput
                    style={styles.input}
                    value={company}
                    onChangeText={setCompany}
                    placeholder="Company"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <TextInput
                    style={styles.input}
                    value={role}
                    onChangeText={setRole}
                    placeholder="Role"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={updateProfile}
                      disabled={updating}
                    >
                      <LinearGradient
                        colors={['#ff6b6b', '#4ecdc4']}
                        style={styles.saveButtonGradient}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <MaskedView
                    style={styles.nameMaskContainer}
                    maskElement={
                      <Text style={styles.nameMask}>
                        {displayName || 'User'}
                      </Text>
                    }
                  >
                    <LinearGradient
                      colors={['#ff6b6b', '#4ecdc4']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.nameGradient}
                    />
                  </MaskedView>
                  <Text style={styles.email}>{user?.email}</Text>
                  {company && <Text style={styles.company}>{company}</Text>}
                  {role && <Text style={styles.role}>{role}</Text>}
                  
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="pencil" size={16} color="#4ecdc4" />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </BlurView>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <BlurView intensity={15} tint="dark" style={styles.statCard}>
                <Ionicons name="analytics" size={24} color="#ff6b6b" />
                <Text style={styles.statNumber}>{stats.totalAnalyses}</Text>
                <Text style={styles.statLabel}>Total Analyses</Text>
              </BlurView>
              
              <BlurView intensity={15} tint="dark" style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#4ecdc4" />
                <Text style={styles.statNumber}>{stats.thisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </BlurView>
              
              <BlurView intensity={15} tint="dark" style={styles.statCard}>
                <Ionicons name="trending-up" size={24} color="#45b7d1" />
                <Text style={styles.statNumber}>{stats.thisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </BlurView>
              
              <BlurView intensity={15} tint="dark" style={styles.statCard}>
                <Ionicons name="flash" size={24} color="#feca57" />
                <Text style={styles.statNumber}>{stats.avgPerWeek}</Text>
                <Text style={styles.statLabel}>Avg/Week</Text>
              </BlurView>
            </View>

            {/* Activity Chart */}
            {monthlyData.length > 0 && (
              <BlurView intensity={15} tint="dark" style={styles.chartCard}>
                <Text style={styles.chartTitle}>Activity Overview</Text>
                <SimpleBarChart data={monthlyData} />
              </BlurView>
            )}

            {/* Favorite Analyses */}
            {favoriteAnalyses.length > 0 && (
              <BlurView intensity={15} tint="dark" style={styles.favoritesCard}>
                <Text style={styles.favoritesTitle}>Favorite Analyses</Text>
                {favoriteAnalyses.map((analysis, index) => (
                  <View key={analysis.id} style={styles.favoriteItem}>
                    <View style={styles.favoriteInfo}>
                      <Text style={styles.favoriteName}>{analysis.product_name}</Text>
                      <Text style={styles.favoriteType}>{analysis.analysis_type}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(analysis.id, true)}
                    >
                      <Ionicons name="heart" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </BlurView>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={exportAnalyses}
              >
                <BlurView intensity={15} tint="dark" style={styles.actionButtonBlur}>
                  <Ionicons name="download" size={20} color="#4ecdc4" />
                  <Text style={styles.actionButtonText}>Export Data</Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSignOut}
              >
                <BlurView intensity={15} tint="dark" style={styles.actionButtonBlur}>
                  <Ionicons name="log-out" size={20} color="#ff6b6b" />
                  <Text style={styles.actionButtonText}>Sign Out</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
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
  settingsButton: {
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
  // Profile Header
  profileHeader: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nameMaskContainer: {
    height: 32,
    marginBottom: 8,
  },
  nameMask: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  nameGradient: {
    flex: 1,
  },
  email: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 4,
  },
  company: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 2,
  },
  role: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  editButtonText: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: '500',
  },
  // Edit Form
  editForm: {
    width: '100%',
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  // Chart
  chartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 24,
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    height: 100,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 80,
  },
  chartBarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  chartBarWrapper: {
    height: 60,
    width: 20,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  chartLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  // Favorites
  favoritesCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 24,
  },
  favoritesTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  favoriteType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  // Actions
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
};

export default ProfileScreen;
