import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { getColors, AppTheme, getTypography } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeSplashScreenProps {
  theme: AppTheme;
  onFinish: () => void;
}

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  theme,
  onFinish
}) => {
  const colors = getColors(theme);
  const typography = getTypography(theme);

  
  const fadeAnim = useRef(new Animated.Value(0)).current;      
  const scaleAnim = useRef(new Animated.Value(0.85)).current;   
  const progressAnim = useRef(new Animated.Value(0)).current;    

  useEffect(() => {
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2700, 
        useNativeDriver: false, 
      })
    ]).start();

    
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {}
      <View style={[styles.ambientGlow, { backgroundColor: colors.primaryLight, opacity: theme === 'dark' ? 0.05 : 0.03 }]} />

      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {}
        <View style={[styles.logoContainer, { backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.08)', shadowColor: colors.primaryLight }]}>
          <Ionicons name="document-text" size={84} color={colors.primaryLight} />
        </View>

        {}
        <Text style={[typography.title, styles.title, { color: colors.text }]}>DevSnippets Notes</Text>
        <Text style={[typography.subtitle, styles.subtitle, { color: colors.secondary }]}>
          Offline-First Developer Sandbox
        </Text>
        
        <Text style={[styles.sloganText, { color: colors.textSecondary }]}>
          Decrypting secure local code vaults...
        </Text>

        {}
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: colors.primaryLight,
                width: progressBarWidth 
              }
            ]} 
          />
        </View>
      </Animated.View>

      {}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Ionicons name="server-outline" size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
        <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '600' }]}>
          SQLite Local Sandbox Drive v1.0
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: '25%',
    left: '10%',
    zIndex: -1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 4,
      }
    })
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  sloganText: {
    fontSize: 12,
    marginTop: 40,
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  progressTrack: {
    width: SCREEN_WIDTH - 120,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
  }
});
