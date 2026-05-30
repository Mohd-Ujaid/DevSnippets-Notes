import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Snippet } from '../services/database';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import { CodeViewer } from './CodeViewer';


import { Ionicons } from '@expo/vector-icons';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  onToggleFavorite: () => void;
  theme?: AppTheme;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onPress,
  onToggleFavorite,
  theme = 'dark'
}) => {
  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  const tagList = snippet.tags
    ? snippet.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const getLanguageBadgeStyle = (lang: string) => {
    const cleanLang = lang.toLowerCase();
    let bg = theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)';
    let text = colors.primaryLight;
    
    if (cleanLang === 'javascript' || cleanLang === 'js') {
      bg = theme === 'dark' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)';
      text = '#F59E0B';
    } else if (cleanLang === 'typescript' || cleanLang === 'ts') {
      bg = theme === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)';
      text = '#3B82F6';
    } else if (cleanLang === 'python' || cleanLang === 'py') {
      bg = theme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)';
      text = colors.secondary;
    } else if (cleanLang === 'html' || cleanLang === 'css') {
      bg = theme === 'dark' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(236, 72, 153, 0.08)';
      text = colors.accentPink;
    } else if (cleanLang === 'sql') {
      bg = theme === 'dark' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)';
      text = '#8B5CF6';
    }
    
    return { backgroundColor: bg, color: text };
  };

  const badgeStyle = getLanguageBadgeStyle(snippet.language);

  return (
    <Pressable 
      style={({ pressed }) => [
        commonStyles.card, 
        styles.cardLayout, 
        { 
          borderLeftWidth: 4, 
          borderLeftColor: badgeStyle.color,
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1
        }
      ]} 
      onPress={onPress} 
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Ionicons name="document-text-outline" size={16} color={badgeStyle.color} style={styles.icon} />
          <Text style={[typography.subtitle, styles.title, { color: colors.text }]} numberOfLines={1}>
            {snippet.title}
          </Text>
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.favoriteButton, 
            { 
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1
            }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Ionicons
            name={snippet.is_favorite === 1 ? 'star' : 'star-outline'}
            size={15}
            color={snippet.is_favorite === 1 ? '#F59E0B' : colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.codeContainer} pointerEvents="none">
        <CodeViewer code={snippet.code} language={snippet.language} maxLines={4} theme={theme} />
      </View>

      <View style={styles.footer}>
        <View style={[styles.languageBadge, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.languageText, { color: badgeStyle.color }]}>
            {snippet.language}
          </Text>
        </View>

        {tagList.length > 0 && (
          <ScrollViewHorizontalTags tags={tagList} colors={colors} />
        )}
      </View>
    </Pressable>
  );
};

const ScrollViewHorizontalTags: React.FC<{ tags: string[]; colors: any }> = ({ tags, colors }) => {
  return (
    <View style={styles.tagsContainer}>
      <Ionicons name="pricetag-outline" size={10} color={colors.textMuted} style={styles.tagIcon} />
      <View style={styles.tagRow}>
        {tags.slice(0, 2).map((tag, idx) => (
          <View key={idx} style={[styles.tagBadge, { borderColor: colors.border }]}>
            <Text style={[styles.tagText, { color: colors.textSecondary }]} numberOfLines={1}>
              #{tag}
            </Text>
          </View>
        ))}
        {tags.length > 2 && (
          <View style={[styles.tagBadge, styles.tagMoreBadge, { borderColor: colors.border }]}>
            <Text style={[styles.tagText, { color: colors.textMuted }]}>
              +{tags.length - 2}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardLayout: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  codeContainer: {
    maxHeight: 110,
    overflow: 'hidden',
    borderRadius: 6,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  languageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 10,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
    borderWidth: 1,
    maxWidth: 75,
  },
  tagMoreBadge: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '500',
  },
});
