import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { databaseService, Snippet } from '../services/database';
import { fileSystemService } from '../services/fileSystem';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import { CodeViewer } from '../components/CodeViewer';
import { Ionicons } from '@expo/vector-icons';

interface SnippetDetailsScreenProps {
  theme?: AppTheme;
  params: { id: number };
  onNavigate: (screen: any, params?: any) => void;
  onGoBack: () => void;
}

export const SnippetDetailsScreen: React.FC<SnippetDetailsScreenProps> = ({
  theme = 'dark',
  params,
  onNavigate,
  onGoBack,
}) => {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'notes'>('code');
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  useEffect(() => {
    loadSnippetDetails();
  }, [params.id]);

  const loadSnippetDetails = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getSnippetById(params.id);
      if (data) {
        setSnippet(data);
      } else {
        Alert.alert('Error', 'Snippet could not be found');
        onGoBack();
      }
    } catch (error) {
      console.error('Failed to load snippet details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!snippet) return;
    try {
      const nextStatus = await databaseService.toggleFavorite(snippet.id, snippet.is_favorite);
      setSnippet((prev) => (prev ? { ...prev, is_favorite: nextStatus } : null));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this code snippet and its local cached files?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!snippet) return;
            try {
              if (snippet.screenshot_path) {
                await fileSystemService.deleteAttachment(snippet.screenshot_path);
              }
              await databaseService.deleteSnippet(snippet.id);
              onGoBack();
            } catch (error) {
              console.error('Failed to delete snippet:', error);
            }
          },
        },
      ]
    );
  };


  const handleExport = async (format: 'txt' | 'js' | 'json') => {
    if (!snippet) return;
    try {
      setExportModalVisible(false);
      setLoading(true);
      
      const fileName = snippet.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      let relativePath = '';
      let fileContent = '';

      switch (format) {
        case 'txt':
          relativePath = `exports/${fileName}.txt`;
          fileContent = `Snippet Title: ${snippet.title}\nLanguage: ${snippet.language}\nTags: ${snippet.tags}\n\nCode:\n${snippet.code}\n\nDescription / Notes:\n${snippet.description || 'No description or notes added for this snippet.'}`;
          break;
        case 'js':
          relativePath = `exports/${fileName}.js`;
          fileContent = `// Title: ${snippet.title}\n// Language: ${snippet.language}\n\n${snippet.code}`;
          break;
        case 'json':
          relativePath = `exports/${fileName}.json`;
          fileContent = JSON.stringify(
            {
              title: snippet.title,
              language: snippet.language,
              tags: snippet.tags ? snippet.tags.split(',') : [],
              code: snippet.code,
              description: snippet.description || ''
            },
            null,
            2
          );
          break;
      }

      await fileSystemService.createFile(relativePath, fileContent);
      await fileSystemService.shareFile(relativePath);
      
      Alert.alert(
        'Export Successful', 
        `Snippet exported and saved to local folder as "${relativePath}".`
      );
    } catch (error) {
      console.error('File export failed:', error);
      Alert.alert('Export Failed', 'Could not export code snippet as file.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !snippet) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!snippet) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Failed to load snippet.</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <View style={styles.row}>
          <Pressable 
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={onGoBack}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable 
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => setExportModalVisible(true)}
          >
            <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={snippet.is_favorite === 1 ? "star" : "star-outline"}
              size={20}
              color={snippet.is_favorite === 1 ? colors.accent : colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onNavigate('create_edit', { id: snippet.id })}
          >
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {}
      <View style={[styles.tabsContainer, { backgroundColor: theme === 'dark' ? '#090D15' : '#E2E8F0', borderBottomColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.85 : 1 }, activeTab === 'code' && [styles.tabActive, { borderBottomColor: colors.primaryLight, backgroundColor: colors.background }]]}
          onPress={() => setActiveTab('code')}
        >
          <Ionicons name="code-working-outline" size={16} color={activeTab === 'code' ? colors.primaryLight : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'code' && { color: colors.text }]}>
            Code & Media
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.85 : 1 }, activeTab === 'notes' && [styles.tabActive, { borderBottomColor: colors.primaryLight, backgroundColor: colors.background }]]}
          onPress={() => setActiveTab('notes')}
        >
          <Ionicons name="document-text-outline" size={16} color={activeTab === 'notes' ? colors.primaryLight : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'notes' && { color: colors.text }]}>
            Notes & Description
          </Text>
        </Pressable>
      </View>

      {}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'code' ? (
          <View>
            <Text style={[typography.title, { fontSize: 20, marginBottom: 8 }]}>{snippet.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.langBadge, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                <Text style={[styles.langText, { color: colors.primaryLight }]}>{snippet.language.toUpperCase()}</Text>
              </View>
              {snippet.tags ? (
                snippet.tags.split(',').map((tag, idx) => (
                  <View key={idx} style={[styles.tagBadge, { borderColor: colors.border, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF' }]}>
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag.trim()}</Text>
                  </View>
                ))
              ) : null}
            </View>

            <CodeViewer code={snippet.code} language={snippet.language} theme={theme} />

            {snippet.screenshot_path ? (
              <View style={[commonStyles.card, { marginTop: 14 }]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ATTACHED SCREENSHOT</Text>
                <Image source={{ uri: snippet.screenshot_path }} style={[styles.screenshotImage, { backgroundColor: colors.codeBg }]} resizeMode="contain" />
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            {snippet.description ? (
              <View style={[commonStyles.card, styles.notesCard]}>
                <View style={[styles.notesHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="document-text" size={20} color={colors.primaryLight} style={styles.notesIcon} />
                  <Text style={[styles.notesTitle, { color: colors.text }]}>Description & Notes</Text>
                </View>
                <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                  {snippet.description}
                </Text>
              </View>
            ) : (
              <View style={[commonStyles.card, styles.noNotesCard]}>
                <Ionicons name="document-text-outline" size={40} color={colors.textMuted} style={styles.noNotesIcon} />
                <Text style={[styles.noNotesTitle, { color: colors.text }]}>No Documentation Found</Text>
                <Text style={[styles.noNotesSubtitle, { color: colors.textMuted }]}>
                  Provide details, code signatures, edge cases, or explanations to organize your knowledge bank perfectly.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.addNotesButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => onNavigate('create_edit', { id: snippet.id })}
                >
                  <Ionicons name="create-outline" size={18} color="#FFF" style={styles.addNotesIcon} />
                  <Text style={styles.addNotesBtnText}>Add Notes & Description</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Export & Share Code</Text>
              <Pressable 
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]} 
                onPress={() => setExportModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Export snippet as a file inside local File Manager drive and share with other apps:
            </Text>

            <Pressable 
              style={({ pressed }) => [styles.exportOption, { backgroundColor: colors.cardBg, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]} 
              onPress={() => handleExport('js')}
            >
              <Ionicons name="code-working-outline" size={20} color={colors.accent} />
              <View style={styles.exportMeta}>
                <Text style={[styles.exportOptName, { color: colors.text }]}>Javascript Source File (.js)</Text>
                <Text style={styles.exportOptDesc}>Clean code file ready for execution</Text>
              </View>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.exportOption, { backgroundColor: colors.cardBg, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]} 
              onPress={() => handleExport('json')}
            >
              <Ionicons name="code-outline" size={20} color={colors.info} />
              <View style={styles.exportMeta}>
                <Text style={[styles.exportOptName, { color: colors.text }]}>JSON Data Object (.json)</Text>
                <Text style={styles.exportOptDesc}>Includes title, language, tags, and AI analysis</Text>
              </View>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.exportOption, { backgroundColor: colors.cardBg, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]} 
              onPress={() => handleExport('txt')}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.secondary} />
              <View style={styles.exportMeta}>
                <Text style={[styles.exportOptName, { color: colors.text }]}>Plain Text Report (.txt)</Text>
                <Text style={styles.exportOptDesc}>Formatted title, tags, code, and explanations</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 8,
    marginHorizontal: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  langText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  screenshotImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  notesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  notesIcon: {
    marginRight: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 13,
    lineHeight: 20,
    padding: 16,
  },
  noNotesCard: {
    alignItems: 'center',
    padding: 28,
    marginVertical: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    backgroundColor: 'rgba(99, 102, 241, 0.01)',
  },
  noNotesIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  noNotesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noNotesSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  addNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addNotesIcon: {
    marginRight: 6,
  },
  addNotesBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 16,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  exportMeta: {
    marginLeft: 12,
  },
  exportOptName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportOptDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
