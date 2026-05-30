import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Pressable,
  SafeAreaView
} from 'react-native';
import { getColors, AppTheme, getTypography } from '../styles/theme';
import { preferencesService, FontSizePreference } from '../services/preferences';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  theme: AppTheme;
  onToggleTheme: () => void;
  onThemeChange: (theme: AppTheme) => void;
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  theme,
  onToggleTheme,
  onThemeChange,
  onComplete
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [fontSize, setFontSize] = useState<FontSizePreference>('medium');
  const scrollRef = useRef<ScrollView>(null);

  const colors = getColors(theme);
  const typography = getTypography(theme);

  useEffect(() => {
    
    async function loadFontSize() {
      const size = await preferencesService.getFontSize();
      setFontSize(size);
    }
    loadFontSize();
  }, []);

  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeSlide && index >= 0 && index <= 3) {
      setActiveSlide(index);
    }
  };

  
  const handleNext = (index: number) => {
    if (index >= 0 && index <= 3) {
      setActiveSlide(index);
      scrollRef.current?.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleThemeSelect = (selectedTheme: AppTheme) => {
    if (theme !== selectedTheme) {
      onThemeChange(selectedTheme);
    }
  };

  const handleFontSizeSelect = async (size: FontSizePreference) => {
    setFontSize(size);
    await preferencesService.saveFontSize(size);
  };

  const handleFinishOnboarding = async () => {
    await preferencesService.saveOnboardingCompleted(true);
    onComplete();
  };

  
  const renderIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {[0, 1, 2, 3].map((i) => {
          const isActive = activeSlide === i;
          return (
            <Pressable
              key={i}
              onPress={() => handleNext(i)}
              style={({ pressed }) => [
                styles.indicatorDot,
                { backgroundColor: colors.border, opacity: pressed ? 0.7 : 1 },
                isActive && {
                  width: 24,
                  backgroundColor: colors.primaryLight,
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.innerContainer}>
        {}
        <View style={styles.blurAccent} />

        {}
        <View style={styles.sliderWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {}
            <View style={styles.slide}>
              <View style={[styles.welcomeLogoContainer, { backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.08)', shadowColor: colors.primaryLight }]}>
                <Ionicons name="document-text" size={72} color={colors.primaryLight} />
              </View>
              <Text style={[typography.title, styles.welcomeTitle, { color: colors.text }]}>DevSnippets Notes</Text>
              <Text style={[typography.subtitle, styles.welcomeSubtitle, { color: colors.secondary }]}>
                Offline-First Developer Sandbox
              </Text>
              <Text style={[typography.bodySecondary, styles.description, { color: colors.textSecondary, marginTop: 12 }]}>
                Welcome to the premium developer notebook. Organize reusable code modules, edit files directly inside an isolated local sandbox, and document implementation signatures entirely on-device.
              </Text>

              {}
              <View style={styles.tagChipsWrapper}>
                {['#SQLite', '#OfflineFirst', '#SandboxDrive', '#TypeScript', '#NoCloud'].map((tag, idx) => (
                  <View key={tag} style={[styles.tagChip, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    <Text style={[styles.tagChipText, { color: idx % 2 === 0 ? colors.primaryLight : colors.secondary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.swipePrompt}>
                <Ionicons name="swap-horizontal-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '600' }]}>Swipe left or tap Next to explore</Text>
              </View>
            </View>

            {}
            <View style={styles.slide}>
              <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.08)' }]}>
                <Ionicons name="shield-checkmark-outline" size={48} color={colors.primaryLight} />
              </View>
              <Text style={[typography.title, styles.title, { color: colors.text }]}>Secure SQLite Vault</Text>
              <Text style={[typography.bodySecondary, styles.description, { color: colors.textSecondary }]}>
                Your developer snippets are safe and stored completely on-device. House critical configs inside a sandboxed SQLite vault with zero external network leakage.
              </Text>

              {}
              <View style={[styles.mockCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.mockHeader, { borderBottomColor: colors.border }]}>
                  <View style={styles.mockDots}>
                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <Text style={[styles.mockTitle, { color: colors.textMuted }]}>sqlite:///vault.db</Text>
                </View>
                <View style={styles.mockContent}>
                  <View style={styles.mockRow}>
                    <Text style={styles.mockId}>01</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mockRowTitle, { color: colors.text }]}>authMiddleware.ts</Text>
                      <Text style={[styles.mockRowSub, { color: colors.textMuted }]}>TypeScript • backend, security</Text>
                    </View>
                    <Ionicons name="star" size={14} color={colors.accent} />
                  </View>
                  <View style={[styles.mockRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={styles.mockId}>02</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mockRowTitle, { color: colors.text }]}>debounce.js</Text>
                      <Text style={[styles.mockRowSub, { color: colors.textMuted }]}>JavaScript • utils, async</Text>
                    </View>
                    <Ionicons name="star-outline" size={14} color={colors.textMuted} />
                  </View>
                </View>
              </View>
            </View>

            {}
            <View style={styles.slide}>
              <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.08)' }]}>
                <Ionicons name="folder-open-outline" size={48} color={colors.secondary} />
              </View>
              <Text style={[typography.title, styles.title, { color: colors.text }]}>Physical Files Sandbox</Text>
              <Text style={[typography.bodySecondary, styles.description, { color: colors.textSecondary }]}>
                An isolated document directory structure built right into your mobile sandbox. Write, view, edit source files offline, and export them natively anytime.
              </Text>

              {}
              <View style={[styles.mockCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.mockHeader, { borderBottomColor: colors.border }]}>
                  <View style={styles.mockDots}>
                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <Text style={[styles.mockTitle, { color: colors.textMuted }]}>/sandbox/workspace</Text>
                </View>
                <View style={styles.mockContent}>
                  <View style={styles.explorerRow}>
                    <Ionicons name="folder" size={16} color={colors.secondary} style={{ marginRight: 8 }} />
                    <Text style={[styles.expName, { color: colors.text }]}>exports</Text>
                    <Text style={[styles.expSize, { color: colors.textMuted }]}>4 files</Text>
                  </View>
                  <View style={styles.explorerRow}>
                    <Ionicons name="folder" size={16} color={colors.secondary} style={{ marginRight: 8 }} />
                    <Text style={[styles.expName, { color: colors.text }]}>templates</Text>
                    <Text style={[styles.expSize, { color: colors.textMuted }]}>8 items</Text>
                  </View>
                  <View style={styles.explorerRow}>
                    <Ionicons name="document-text-outline" size={16} color={colors.primaryLight} style={{ marginRight: 8 }} />
                    <Text style={[styles.expName, { color: colors.text }]}>readme.txt</Text>
                    <Text style={[styles.expSize, { color: colors.textMuted }]}>1.2 KB</Text>
                  </View>
                </View>
              </View>
            </View>

            {}
            <View style={styles.slide}>
              <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.08)' }]}>
                <Ionicons name="options-outline" size={48} color={colors.accent} />
              </View>
              <Text style={[typography.title, styles.title, { color: colors.text }]}>Configure Environment</Text>
              <Text style={[typography.bodySecondary, styles.description, { color: colors.textSecondary }]}>
                Set up your primary interface parameters. Toggle between the sleek neon aesthetics and calibrate your default code workspace text sizes.
              </Text>

              {}
              <View style={[styles.configCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.configHeading, { color: colors.text }]}>1. SELECT THEME</Text>
                <View style={styles.themeOptions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.themeBtn,
                      { borderColor: colors.border, backgroundColor: colors.codeBg, opacity: pressed ? 0.8 : 1 },
                      theme === 'dark' && { borderColor: colors.primaryLight, backgroundColor: 'rgba(99, 102, 241, 0.15)' }
                    ]}
                    onPress={() => handleThemeSelect('dark')}
                  >
                    <Ionicons name="moon" size={18} color={theme === 'dark' ? colors.primaryLight : colors.textMuted} />
                    <Text style={[styles.themeLabel, { color: theme === 'dark' ? colors.text : colors.textMuted }]}>Neon Dark</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.themeBtn,
                      { borderColor: colors.border, backgroundColor: colors.codeBg, opacity: pressed ? 0.8 : 1 },
                      theme === 'light' && { borderColor: colors.accent, backgroundColor: 'rgba(217, 119, 6, 0.12)' }
                    ]}
                    onPress={() => handleThemeSelect('light')}
                  >
                    <Ionicons name="sunny" size={18} color={theme === 'light' ? colors.accent : colors.textMuted} />
                    <Text style={[styles.themeLabel, { color: theme === 'light' ? colors.text : colors.textMuted }]}>Slate Light</Text>
                  </Pressable>
                </View>

                <Text style={[styles.configHeading, { color: colors.text, marginTop: 16 }]}>2. SELECT FONT SIZE</Text>
                <View style={styles.fontOptions}>
                  {(['small', 'medium', 'large'] as FontSizePreference[]).map((size) => {
                    const isSelected = fontSize === size;
                    return (
                      <Pressable
                        key={size}
                        style={({ pressed }) => [
                          styles.fontBtn,
                          { borderColor: colors.border, backgroundColor: colors.codeBg, opacity: pressed ? 0.8 : 1 },
                          isSelected && { borderColor: colors.secondary, backgroundColor: 'rgba(16, 185, 129, 0.12)' }
                        ]}
                        onPress={() => handleFontSizeSelect(size)}
                      >
                        <Text style={[
                          styles.fontLabel,
                          { color: isSelected ? colors.text : colors.textMuted, fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16 }
                        ]}>
                          {size.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {}
        {renderIndicators()}

        {}
        <View style={styles.buttonWrapper}>
          {activeSlide < 3 ? (
            <View style={styles.rowBetween}>
              <Pressable
                style={({ pressed }) => [
                  styles.skipBtn,
                  { opacity: pressed ? 0.6 : 1 }
                ]}
                onPress={() => handleNext(3)}
              >
                <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.nextBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={() => handleNext(activeSlide + 1)}
              >
                <Text style={styles.nextText}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.finishBtn,
                { backgroundColor: colors.secondary, opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={handleFinishOnboarding}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.finishText}>Launch Developer Vault</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  blurAccent: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    zIndex: -1,
  },
  sliderWrapper: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeLogoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 4,
      }
    })
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  tagChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 12,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    margin: 4,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  swipePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      }
    })
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  description: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  mockCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    })
  },
  mockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  mockDots: {
    flexDirection: 'row',
    position: 'absolute',
    left: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 4,
  },
  mockTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  mockContent: {
    padding: 12,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  mockId: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: 'bold',
    marginRight: 10,
    width: 16,
  },
  mockRowTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  mockRowSub: {
    fontSize: 10,
    marginTop: 2,
  },
  explorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  expSize: {
    fontSize: 11,
  },
  configCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  configHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    marginRight: 6,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  fontOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    marginHorizontal: 3,
  },
  fontLabel: {
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonWrapper: {
    paddingHorizontal: 28,
    marginTop: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
  },
  finishText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
