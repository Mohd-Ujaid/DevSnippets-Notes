import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'DEV_SNIPPETS_THEME';
const FONT_SIZE_KEY = 'DEV_SNIPPETS_FONT_SIZE';
const ONBOARDING_COMPLETE_KEY = 'DEV_SNIPPETS_ONBOARDING_COMPLETE_GATE';

export type AppTheme = 'dark' | 'light';
export type FontSizePreference = 'small' | 'medium' | 'large';

export const preferencesService = {
  
  async saveTheme(theme: AppTheme): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  },

  
  async getTheme(): Promise<AppTheme> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as AppTheme) || 'dark';
    } catch (error) {
      console.error('Error getting theme from AsyncStorage:', error);
      return 'dark';
    }
  },

  
  async saveFontSize(size: FontSizePreference): Promise<void> {
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, size);
    } catch (error) {
      console.error('Error saving font size to AsyncStorage:', error);
    }
  },

  
  async getFontSize(): Promise<FontSizePreference> {
    try {
      const size = await AsyncStorage.getItem(FONT_SIZE_KEY);
      return (size as FontSizePreference) || 'medium';
    } catch (error) {
      console.error('Error getting font size from AsyncStorage:', error);
      return 'medium';
    }
  },

  
  async saveOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, completed ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving onboarding status to AsyncStorage:', error);
    }
  },

  
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status from AsyncStorage:', error);
      return false;
    }
  }
};
