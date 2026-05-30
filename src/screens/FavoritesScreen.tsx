import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { databaseService, Snippet } from '../services/database';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import { SnippetCard } from '../components/SnippetCard';


import { Ionicons } from '@expo/vector-icons';

interface FavoritesScreenProps {
  theme?: AppTheme;
  onNavigate: (screen: any, params?: any) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ theme = 'dark', onNavigate }) => {
  const [favorites, setFavorites] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getFavoriteSnippets();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorite snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (snippet: Snippet) => {
    try {
      await databaseService.toggleFavorite(snippet.id, snippet.is_favorite);
      setFavorites((prev) => prev.filter((s) => s.id !== snippet.id));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <View style={commonStyles.container}>
      {}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="star" size={20} color={colors.accent} style={styles.headerIcon} />
          <Text style={[typography.title, { fontSize: 22, letterSpacing: 0.5 }]}>Favorites</Text>
        </View>
        <Text style={[typography.caption, { marginTop: 2 }]}>Quick-access pinned code snippets</Text>
      </View>

      {}
      {loading && favorites.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="code-slash-outline" size={48} color={colors.textMuted} style={styles.emptyIcon} />
          <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: 6 }]}>No favorites yet</Text>
          <Text style={[typography.caption, { textAlign: 'center', lineHeight: 18 }]}>
            Go back to the Home Screen and tap the star icon on any code card to bookmark it here for fast retrieval.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={loadFavorites}
          refreshing={loading}
          renderItem={({ item }) => (
            <SnippetCard
              snippet={item}
              theme={theme}
              onPress={() => onNavigate('snippet_details', { id: item.id })}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerIcon: {
    marginRight: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
