import * as SecureStore from 'expo-secure-store';

class StorageService {
  // Store analysis history locally
  async saveAnalysis(analysis) {
    try {
      const existing = await this.getAnalysisHistory();
      const newAnalysis = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...analysis
      };
      
      const updated = [newAnalysis, ...existing.slice(0, 19)]; // Keep last 20
      await SecureStore.setItemAsync('analysisHistory', JSON.stringify(updated));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save analysis' };
    }
  }

  async getAnalysisHistory() {
    try {
      const history = await SecureStore.getItemAsync('analysisHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return [];
    }
  }

  async clearAnalysisHistory() {
    try {
      await SecureStore.deleteItemAsync('analysisHistory');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to clear history' };
    }
  }

  // App preferences
  async savePreference(key, value) {
    try {
      await SecureStore.setItemAsync(`pref_${key}`, JSON.stringify(value));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save preference' };
    }
  }

  async getPreference(key, defaultValue = null) {
    try {
      const value = await SecureStore.getItemAsync(`pref_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
}

export default new StorageService();
