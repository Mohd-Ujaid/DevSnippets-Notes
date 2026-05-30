import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { databaseService } from '../services/database';
import { fileSystemService } from '../services/fileSystem';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';


import { Ionicons } from '@expo/vector-icons';

interface CreateSnippetScreenProps {
  theme?: AppTheme;
  params?: { id?: number };
  onNavigate: (screen: any, params?: any) => void;
  onGoBack: () => void;
}

export const CreateSnippetScreen: React.FC<CreateSnippetScreenProps> = ({
  theme = 'dark',
  params,
  onNavigate,
  onGoBack,
}) => {
  const isEditing = !!(params && params.id);
  const [loading, setLoading] = useState(false);

  
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);

  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  const standardLanguages = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL', 'C++', 'Java', 'Rust', 'Bash'];

  useEffect(() => {
    if (isEditing && params?.id) {
      loadSnippetForEditing(params.id);
    }
  }, [isEditing, params?.id]);

  const loadSnippetForEditing = async (id: number) => {
    try {
      setLoading(true);
      const snippet = await databaseService.getSnippetById(id);
      if (snippet) {
        setTitle(snippet.title);
        setCode(snippet.code);
        setDescription(snippet.description || '');
        setLanguage(snippet.language);
        setTags(snippet.tags || '');
        setIsFavorite(snippet.is_favorite === 1);
        setScreenshotUri(snippet.screenshot_path);
      } else {
        Alert.alert('Error', 'Snippet not found in database');
        onGoBack();
      }
    } catch (error) {
      console.error('Failed to load snippet for editing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permissions to access photo library are required to attach screenshots.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        
        setLoading(true);
        const persistentUri = await fileSystemService.saveAttachment(selectedUri);
        
        if (screenshotUri) {
          await fileSystemService.deleteAttachment(screenshotUri);
        }
        
        setScreenshotUri(persistentUri);
      }
    } catch (error) {
      console.error('Image picking failed:', error);
      Alert.alert('Error', 'Failed to pick or save screenshot image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScreenshot = async () => {
    try {
      if (screenshotUri) {
        await fileSystemService.deleteAttachment(screenshotUri);
        setScreenshotUri(null);
      }
    } catch (error) {
      console.error('Failed to delete screenshot:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a snippet title');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Validation Error', 'Please enter some code content');
      return;
    }

    try {
      setLoading(true);
      
      const cleanTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .join(',');

      if (isEditing && params?.id) {
        await databaseService.updateSnippet(
          params.id,
          title,
          code,
          language,
          cleanTags,
          isFavorite,
          screenshotUri,
          description
        );
        onGoBack();
      } else {
        await databaseService.createSnippet(
          title,
          code,
          language,
          cleanTags,
          isFavorite,
          screenshotUri,
          description
        );
        onNavigate('home');
      }
    } catch (error) {
      console.error('Database write failed:', error);
      Alert.alert('Error', 'Failed to save code snippet to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      {}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <Pressable 
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]} 
          onPress={onGoBack}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[typography.subtitle, { fontSize: 18 }]}>
          {isEditing ? 'Edit Snippet' : 'New Snippet'}
        </Text>
        <Pressable 
          style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }, loading && { backgroundColor: colors.border }]} 
          onPress={handleSave} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="save-outline" size={18} color="#FFF" />
          )}
        </Pressable>
      </View>

      {loading && !title ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Snippet Title</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. Fetch API request wrapper"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {}
          <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Language</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageScroll}
          >
            {standardLanguages.map((lang) => {
              const isSelected = language.toLowerCase() === lang.toLowerCase();
              return (
                <Pressable
                  key={lang}
                  style={({ pressed }) => [
                    styles.langTab,
                    { borderColor: colors.border, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF', opacity: pressed ? 0.7 : 1 },
                    isSelected && { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: colors.primaryLight },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.langText,
                      { color: colors.textSecondary },
                      isSelected && { color: colors.primaryLight, fontWeight: 'bold' },
                    ]}
                  >
                    {lang}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {}
          <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Description & Notes</Text>
          <TextInput
            style={[commonStyles.input, styles.descriptionInput]}
            placeholder="e.g. Asynchronous helper to query user profiles. Handles empty results."
            placeholderTextColor={colors.textMuted}
            multiline={true}
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          {}
          <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Code Content</Text>
          <View style={[styles.codeEditorContainer, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
            <TextInput
              style={[styles.codeEditor, { color: theme === 'dark' ? '#34D399' : '#047857' }]}
              placeholder={`// Paste or write your code snippet here...\nfunction example() {\n  return "DevSnippets AI";\n}`}
              placeholderTextColor={colors.textMuted}
              multiline={true}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              value={code}
              onChangeText={setCode}
            />
          </View>

          {}
          <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Tags (comma-separated)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. react, hooks, async, fetch"
            placeholderTextColor={colors.textMuted}
            value={tags}
            onChangeText={setTags}
          />

          {}
          <Text style={[styles.label, { marginTop: 16, color: colors.textSecondary }]}>Visual Screenshot Attachment</Text>
          {screenshotUri ? (
            <View style={[styles.screenshotPreviewContainer, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
              <Image source={{ uri: screenshotUri }} style={styles.screenshotPreview} resizeMode="contain" />
              <Pressable
                style={({ pressed }) => [styles.deleteScreenshotBtn, { backgroundColor: colors.danger, opacity: pressed ? 0.7 : 1 }]}
                onPress={handleRemoveScreenshot}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.deleteScreenshotText}>Remove Screenshot</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable 
              style={({ pressed }) => [styles.attachButton, { borderColor: colors.border, backgroundColor: theme === 'dark' ? 'rgba(99,102,241,0.02)' : '#FFFFFF', opacity: pressed ? 0.7 : 1 }]} 
              onPress={handlePickImage} 
            >
              <Ionicons name="image-outline" size={20} color={colors.primaryLight} style={styles.attachIcon} />
              <Text style={[styles.attachText, { color: colors.primaryLight }]}>Attach Screenshot from Gallery</Text>
            </Pressable>
          )}

          {}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  languageScroll: {
    paddingBottom: 4,
  },
  langTab: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  langText: {
    fontSize: 12,
  },
  codeEditorContainer: {
    borderRadius: 8,
    borderWidth: 1,
    height: 200,
    overflow: 'hidden',
  },
  codeEditor: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    padding: 12,
    textAlignVertical: 'top',
  },
  attachButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  attachIcon: {
    marginRight: 8,
  },
  attachText: {
    fontSize: 13,
    fontWeight: '600',
  },
  screenshotPreviewContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  screenshotPreview: {
    width: '100%',
    height: 150,
    borderRadius: 6,
  },
  deleteScreenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  deleteScreenshotText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
