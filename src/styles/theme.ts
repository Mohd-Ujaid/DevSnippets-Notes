import { StyleSheet } from 'react-native';

export type AppTheme = 'dark' | 'light';

export const DARK_COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  accent: '#F59E0B',
  accentPink: '#EC4899',

  background: '#0B0F19',
  cardBg: '#1E293B',
  cardBgGlass: 'rgba(30, 41, 59, 0.7)',
  border: '#334155',
  borderActive: '#4F46E5',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  codeBg: '#090D16',

  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const LIGHT_COLORS = {
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  secondary: '#059669',
  accent: '#D97706',
  accentPink: '#DB2777',


  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  cardBgGlass: 'rgba(255, 255, 255, 0.85)',
  border: '#E2E8F0',
  borderActive: '#6366F1',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  codeBg: '#F1F5F9',

  danger: '#DC2626',
  success: '#059669',
  warning: '#D97706',
  info: '#2563EB',
};

export const getColors = (theme: AppTheme) => {
  return theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};

export const getTypography = (theme: AppTheme) => {
  const colors = getColors(theme);
  return {
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.text,
    },
    body: {
      fontSize: 14,
      color: colors.text,
    },
    bodySecondary: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: 12,
      color: colors.textMuted,
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 13,
      color: theme === 'dark' ? '#34D399' : '#059669',
    }
  };
};

export const getStyles = (theme: AppTheme) => {
  const colors = getColors(theme);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      shadowColor: theme === 'dark' ? '#000' : 'rgba(15, 23, 42, 0.08)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.4,
      shadowRadius: 5,
      elevation: 4,
    },
    glassCard: {
      backgroundColor: colors.cardBgGlass,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      padding: 16,
    },
    input: {
      backgroundColor: colors.codeBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
    },
    inputFocused: {
      borderColor: colors.borderActive,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
    },
    btnPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnSecondary: {
      backgroundColor: 'transparent',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    }
  });
};


export const COLORS = DARK_COLORS;
export const TYPOGRAPHY = getTypography('dark');
export const COMMON_STYLES = getStyles('dark');
