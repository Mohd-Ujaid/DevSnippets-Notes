import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { databaseService, Snippet } from '../services/database';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import { SnippetCard } from '../components/SnippetCard';


import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeScreenProps {
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onNavigate: (screen: any, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  theme = 'dark', 
  onToggleTheme, 
  onNavigate 
}) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [loading, setLoading] = useState(true);

  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  const filterLanguages = ['All', 'JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL'];

  const refreshSnippets = async () => {
    try {
      setLoading(true);
      let data: Snippet[] = [];
      if (searchQuery.trim()) {
        data = await databaseService.searchSnippets(searchQuery);
      } else {
        data = await databaseService.getAllSnippets();
      }

      if (selectedLanguage !== 'All') {
        data = data.filter(
          (s) => s.language.toLowerCase() === selectedLanguage.toLowerCase()
        );
      }

      setSnippets(data);
    } catch (error) {
      console.error('Error loading snippets from database:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSnippets();
  }, [searchQuery, selectedLanguage]);

  const handleToggleFavorite = async (snippet: Snippet) => {
    try {
      const nextStatus = await databaseService.toggleFavorite(snippet.id, snippet.is_favorite);
      setSnippets((prev) =>
        prev.map((s) => (s.id === snippet.id ? { ...s, is_favorite: nextStatus } : s))
      );
    } catch (error) {
      console.error('Failed to toggle favorite status:', error);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {}
      <View style={[localStyles.header, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <View style={localStyles.headerMainRow}>
          <View>
            <View style={localStyles.headerTitleContainer}>
              <Ionicons name="document-text" size={20} color={colors.primaryLight} style={localStyles.headerSparkle} />
              <Text style={[typography.title, { fontSize: 22, letterSpacing: 0.5 }]}>DevSnippets Notes</Text>
            </View>
            <Text style={[typography.caption, { marginTop: 2, color: colors.textSecondary }]}>Offline-First Custom Dev Notes</Text>
          </View>

          {}
          {onToggleTheme && (
            <Pressable 
              style={({ pressed }) => [
                localStyles.themeToggleBtn, 
                { 
                  backgroundColor: theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(217,119,6,0.1)', 
                  borderColor: theme === 'dark' ? colors.primaryLight : colors.accent,
                  opacity: pressed ? 0.7 : 1
                }
              ]} 
              onPress={onToggleTheme}
            >
              {theme === 'dark' ? (
                <Ionicons name="sunny-outline" size={18} color={colors.primaryLight} />
              ) : (
                <Ionicons name="moon-outline" size={18} color={colors.accent} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {}
      <View style={localStyles.searchContainer}>
        <View style={[
          localStyles.searchBar, 
          { 
            backgroundColor: colors.codeBg, 
            borderColor: colors.border,
            shadowColor: colors.primary,
          }
        ]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={localStyles.searchIcon} />
          <TextInput
            style={[localStyles.searchInput, { color: colors.text }]}
            placeholder="Search title, code, tags..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable 
              onPress={() => setSearchQuery('')} 
              style={({ pressed }) => [localStyles.clearBtn, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Text style={[localStyles.clearText, { color: colors.primaryLight }]}>Clear</Text>
            </Pressable>
          )}
        </View>
      </View>

      {}
      <View style={localStyles.filterContainer}>
        <View style={localStyles.filterLabelRow}>
          <Ionicons name="funnel-outline" size={12} color={colors.textSecondary} />
          <Text style={[localStyles.filterLabel, { color: colors.textMuted }]}>LANGUAGES</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={localStyles.filterScroll}
        >
          {filterLanguages.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <Pressable
                key={lang}
                style={({ pressed }) => [
                  localStyles.filterTab,
                  { 
                    borderColor: colors.border, 
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                    opacity: pressed ? 0.7 : 1
                  },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primaryLight },
                ]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text
                  style={[
                    localStyles.filterText,
                    { color: colors.textSecondary },
                    isSelected && { color: '#FFF', fontWeight: 'bold' },
                  ]}
                >
                  {lang}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {}
      {loading && snippets.length === 0 ? (
        <View style={localStyles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : snippets.length === 0 ? (
        <View style={localStyles.emptyContainer}>
          <Ionicons name="code-slash-outline" size={48} color={colors.textMuted} style={localStyles.emptyIcon} />
          <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: 6 }]}>No snippets found</Text>
          <Text style={[typography.caption, { textAlign: 'center', lineHeight: 18, color: colors.textMuted }]}>
            {searchQuery || selectedLanguage !== 'All'
              ? 'Try modifying your search queries or active filters.'
              : 'Create your first developer utility snippet by clicking the neon plus button!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={snippets}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={localStyles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={refreshSnippets}
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

      {}
      <Pressable
        style={({ pressed }) => [
          localStyles.fab, 
          { 
            backgroundColor: colors.primary, 
            shadowColor: colors.primary,
            opacity: pressed ? 0.8 : 1
          }
        ]}
        onPress={() => onNavigate('create_edit')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </Pressable>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSparkle: {
    marginRight: 6,
  },
  themeToggleBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    marginTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    marginTop: 6,
  },
  filterTab: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
