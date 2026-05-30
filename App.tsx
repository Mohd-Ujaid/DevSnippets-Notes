import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Pressable, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { databaseService } from './src/services/database';
import { fileSystemService } from './src/services/fileSystem';
import { preferencesService } from './src/services/preferences';
import { getColors, AppTheme } from './src/styles/theme';


import { HomeScreen } from './src/screens/HomeScreen';
import { SnippetDetailsScreen } from './src/screens/SnippetDetailsScreen';
import { CreateSnippetScreen } from './src/screens/CreateSnippetScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { FileManagerScreen } from './src/screens/FileManagerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { WelcomeSplashScreen } from './src/screens/WelcomeSplashScreen';


import { Ionicons } from '@expo/vector-icons';

type ScreenName = 'home' | 'create_edit' | 'snippet_details' | 'favorites' | 'file_manager' | 'settings' | 'onboarding' | 'welcome_splash';

interface NavigationHistoryItem {
  screen: ScreenName;
  params?: any;
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('dark');
  
  
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [navHistory, setNavHistory] = useState<NavigationHistoryItem[]>([]);

  
  useEffect(() => {
    async function bootstrapApp() {
      try {
        
        const savedTheme = await preferencesService.getTheme();
        setTheme(savedTheme);

        
        await databaseService.initDatabase();

        
        await fileSystemService.initDirectories();
        
        
        const count = await databaseService.getRowCount();
        if (count === 0) {
          await databaseService.createSnippet(
            'React Clean State Hook',
            `import { useState } from 'react';\n\nexport function useToggle(initialValue = false) {\n  const [value, setValue] = useState(initialValue);\n  const toggle = () => setValue((v) => !v);\n  return [value, toggle] as const;\n}`,
            'TypeScript',
            'react,hooks,typescript',
            true 
          );
          
          await databaseService.createSnippet(
            'Node Lightweight HTTP Router',
            `const http = require('http');\n\nconst server = http.createServer((req, res) => {\n  if (req.url === '/api/health' && req.method === 'GET') {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({ status: 'OK', engine: 'V8' }));\n  } else {\n    res.writeHead(404);\n    res.end('Not Found');\n  }\n});\n\nserver.listen(3000, () => console.log('Listening on 3000'));`,
            'JavaScript',
            'node,backend,http',
            false
          );
        }

        
        setCurrentScreen('welcome_splash');
      } catch (error) {
        console.error('Bootstrapping error:', error);
      } finally {
        setAppReady(true);
      }
    }

    bootstrapApp();
  }, []);

  
  useEffect(() => {
    const handleBackButton = () => {
      if (navHistory.length > 0) {
        goBack();
        return true; 
      }
      return false; 
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => subscription.remove();
  }, [navHistory]);

  
  const navigateTo = (screen: ScreenName, params: any = null) => {
    setNavHistory((prev) => [...prev, { screen: currentScreen, params: screenParams }]);
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const goBack = () => {
    if (navHistory.length === 0) return;
    
    setNavHistory((prev) => {
      const historyCopy = [...prev];
      const previous = historyCopy.pop();
      if (previous) {
        setCurrentScreen(previous.screen);
        setScreenParams(previous.params);
      }
      return historyCopy;
    });
  };

  
  const switchTab = (tab: 'home' | 'favorites' | 'file_manager' | 'settings') => {
    setNavHistory([]); 
    setCurrentScreen(tab);
    setScreenParams(null);
  };

  
  const handleToggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    await preferencesService.saveTheme(nextTheme);
  };

  
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen theme={theme} onToggleTheme={handleToggleTheme} onNavigate={navigateTo} />;
      case 'snippet_details':
        return <SnippetDetailsScreen theme={theme} params={screenParams} onNavigate={navigateTo} onGoBack={goBack} />;
      case 'create_edit':
        return <CreateSnippetScreen theme={theme} params={screenParams} onNavigate={navigateTo} onGoBack={goBack} />;
      case 'favorites':
        return <FavoritesScreen theme={theme} onNavigate={navigateTo} />;
      case 'file_manager':
        return <FileManagerScreen theme={theme} />;
      case 'settings':
        return <SettingsScreen theme={theme} onToggleTheme={handleToggleTheme} onNavigate={navigateTo} />;
      case 'onboarding':
        return (
          <OnboardingScreen
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onThemeChange={async (newTheme) => {
              setTheme(newTheme);
              await preferencesService.saveTheme(newTheme);
            }}
            onComplete={() => {
              setCurrentScreen('home');
            }}
          />
        );
      case 'welcome_splash':
        return (
          <WelcomeSplashScreen
            theme={theme}
            onFinish={() => {
              setCurrentScreen('onboarding');
            }}
          />
        );
      default:
        return <HomeScreen theme={theme} onNavigate={navigateTo} />;
    }
  };

  const isTabBarVisible = ['home', 'favorites', 'file_manager', 'settings'].includes(currentScreen);
  const colors = getColors(theme);

  if (!appReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="document-text" size={44} color={colors.primaryLight} style={styles.loadingIcon} />
        <Text style={[styles.loadingTitle, { color: colors.text }]}>DevSnippets Notes</Text>
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Initializing offline SQLite vaults...</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
      
      {}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {}
      {isTabBarVisible && (
        <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
          <Pressable 
            style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => switchTab('home')}
          >
            <Ionicons name={currentScreen === 'home' ? 'code-slash' : 'code-slash-outline'} size={20} color={currentScreen === 'home' ? colors.primaryLight : colors.textMuted} />
            <Text style={[
              styles.tabText, 
              { color: colors.textMuted },
              currentScreen === 'home' && { color: colors.primaryLight, fontWeight: '700' }
            ]}>
              Snippets
            </Text>
            {currentScreen === 'home' && <View style={[styles.activeIndicator, { backgroundColor: colors.primaryLight }]} />}
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => switchTab('favorites')}
          >
            <Ionicons name={currentScreen === 'favorites' ? 'star' : 'star-outline'} size={20} color={currentScreen === 'favorites' ? colors.accent : colors.textMuted} />
            <Text style={[
              styles.tabText, 
              { color: colors.textMuted },
              currentScreen === 'favorites' && { color: colors.accent, fontWeight: '700' }
            ]}>
              Favorites
            </Text>
            {currentScreen === 'favorites' && <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />}
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => switchTab('file_manager')}
          >
            <Ionicons name={currentScreen === 'file_manager' ? 'folder' : 'folder-outline'} size={20} color={currentScreen === 'file_manager' ? colors.secondary : colors.textMuted} />
            <Text style={[
              styles.tabText, 
              { color: colors.textMuted },
              currentScreen === 'file_manager' && { color: colors.secondary, fontWeight: '700' }
            ]}>
              Files
            </Text>
            {currentScreen === 'file_manager' && <View style={[styles.activeIndicator, { backgroundColor: colors.secondary }]} />}
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.tabItem, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => switchTab('settings')}
          >
            <Ionicons name={currentScreen === 'settings' ? 'settings' : 'settings-outline'} size={20} color={currentScreen === 'settings' ? colors.primaryLight : colors.textMuted} />
            <Text style={[
              styles.tabText, 
              { color: colors.textMuted },
              currentScreen === 'settings' && { color: colors.primaryLight, fontWeight: '700' }
            ]}>
              Settings
            </Text>
            {currentScreen === 'settings' && <View style={[styles.activeIndicator, { backgroundColor: colors.primaryLight }]} />}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  loadingText: {
    fontSize: 12,
    marginTop: 6,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    paddingTop: 8,
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 14,
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  }
});
