import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { databaseService } from '../services/database';
import { fileSystemService } from '../services/fileSystem';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import { preferencesService } from '../services/preferences';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  theme?: AppTheme;
  onToggleTheme: () => void;
  onNavigate?: (screen: any) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  theme = 'dark', 
  onToggleTheme,
  onNavigate
}) => {
  
  const [totalSnippets, setTotalSnippets] = useState(0);
  const [workspaceUri, setWorkspaceUri] = useState('');
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setDiagnosticLoading(true);
      
      const count = await databaseService.getRowCount();
      setTotalSnippets(count);

      setWorkspaceUri(FileSystem.documentDirectory || 'sandbox://documentDirectory');
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Data Structure',
      'This will wipe all saved code snippets from SQLite and re-seed the file manager directories. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset and Seed',
          style: 'destructive',
          onPress: async () => {
            try {
              setDiagnosticLoading(true);
              
              await fileSystemService.deleteItem('exports');
              await fileSystemService.deleteItem('templates');
              await fileSystemService.deleteItem('utilities');
              await fileSystemService.deleteItem('readme.txt');
              await fileSystemService.seedDefaultTemplates();

              const db = databaseService.getDatabase();
              await db.execAsync('DROP TABLE IF EXISTS snippets;');
              await databaseService.initDatabase();

              await databaseService.createSnippet(
                'Fetch API Async Utility',
                `async function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error("HTTP Error " + response.status);\n    return await response.json();\n  } catch (error) {\n    console.error("Fetch failed:", error);\n    throw error;\n  }\n}`,
                'JavaScript',
                'async,fetch,utility',
                true
              );

              await preferencesService.saveOnboardingCompleted(false);
              await loadSettings();
              Alert.alert('Reset Complete', 'Database schema rebuilt and workspace templates re-seeded successfully.');
            } catch (error) {
              console.error('Database reset failed:', error);
              Alert.alert('Error', 'Failed to rebuild database');
            } finally {
              setDiagnosticLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      {}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="settings-outline" size={20} color={colors.primaryLight} style={styles.headerIcon} />
          <Text style={[typography.title, { fontSize: 22, letterSpacing: 0.5 }]}>System Settings</Text>
        </View>
        <Text style={[typography.caption, { marginTop: 2 }]}>Configure AI tokens & local storage assets</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {}
        <View style={[commonStyles.card, styles.sectionCard]}>
          <View style={styles.row}>
            {theme === 'dark' ? (
              <Ionicons name="moon-outline" size={18} color={colors.primaryLight} style={styles.sectionIcon} />
            ) : (
              <Ionicons name="sunny-outline" size={18} color={colors.accent} style={styles.sectionIcon} />
            )}
            <Text style={[typography.subtitle, { fontSize: 15 }]}>Application Theme</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Toggle between the default premium IDE-inspired Neon-Dark theme or a high-contrast Slate-Light theme.
          </Text>

          <Pressable 
            style={({ pressed }) => [styles.toggleThemeButton, { backgroundColor: theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(217,119,6,0.1)', borderColor: theme === 'dark' ? colors.primaryLight : colors.accent, opacity: pressed ? 0.8 : 1 }]}
            onPress={onToggleTheme}
          >
            {theme === 'dark' ? (
              <View style={styles.row}>
                <Ionicons name="sunny-outline" size={16} color={colors.primaryLight} style={{ marginRight: 6 }} />
                <Text style={[styles.themeBtnText, { color: colors.primaryLight }]}>Switch to Slate Light Mode</Text>
              </View>
            ) : (
              <View style={styles.row}>
                <Ionicons name="moon-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.themeBtnText, { color: colors.accent }]}>Switch to Neon Dark Mode</Text>
              </View>
            )}
          </Pressable>
        </View>

        {}
        <View style={[commonStyles.card, styles.sectionCard]}>
          <View style={styles.row}>
            <Ionicons name="help-buoy-outline" size={18} color={colors.primaryLight} style={styles.sectionIcon} />
            <Text style={[typography.subtitle, { fontSize: 15 }]}>Guided Walkthrough</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Review the original onboarding sequence to learn more about the offline SQLite vault, physical sandbox directory structure, and theme customizations.
          </Text>

          <Pressable 
            style={({ pressed }) => [styles.toggleThemeButton, { borderColor: colors.primaryLight, backgroundColor: 'rgba(99,102,241,0.02)', opacity: pressed ? 0.8 : 1 }]}
            onPress={async () => {
              if (onNavigate) {
                await preferencesService.saveOnboardingCompleted(false);
                onNavigate('onboarding');
              }
            }}
          >
            <View style={styles.row}>
              <Ionicons name="play-circle-outline" size={16} color={colors.primaryLight} style={{ marginRight: 6 }} />
              <Text style={[styles.themeBtnText, { color: colors.primaryLight }]}>Replay Onboarding Guide</Text>
            </View>
          </Pressable>
        </View>

        {}
        <View style={[commonStyles.card, styles.sectionCard]}>
          <View style={styles.row}>
            <Ionicons name="code-working-outline" size={18} color={colors.primaryLight} style={styles.sectionIcon} />
            <Text style={[typography.subtitle, { fontSize: 15 }]}>Developer Workspace Sandbox</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Your snippets are saved securely in an isolated SQLite database on your device. Local physical files and exported scripts are sandboxed inside the app's directory.
          </Text>
          
          <View style={[styles.diagnosticTable, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
            <View style={[styles.diagnosticRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Storage Provider:</Text>
              <Text style={[styles.diagVal, { color: colors.secondary }]}>SQLite (Online)</Text>
            </View>
            <View style={[styles.diagnosticRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Physical Drive FileSystem:</Text>
              <Text style={[styles.diagVal, { color: colors.primaryLight }]}>Sandboxed Legacy Mode</Text>
            </View>
            <View style={[styles.diagnosticRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Default Sync Strategy:</Text>
              <Text style={[styles.diagVal, { color: colors.accent }]}>Local-First Promise Queue</Text>
            </View>
          </View>
        </View>

        <View style={[commonStyles.card, styles.sectionCard]}>
          <View style={styles.row}>
            <Ionicons name="server-outline" size={18} color={colors.primaryLight} style={styles.sectionIcon} />
            <Text style={[typography.subtitle, { fontSize: 15 }]}>Local Drive & SQLite Health</Text>
          </View>
          
          {diagnosticLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            <View style={[styles.diagnosticTable, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
              <View style={[styles.diagnosticRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Total SQLite Snippets:</Text>
                <Text style={[styles.diagVal, { color: colors.text }]}>{totalSnippets} rows</Text>
              </View>

              <View style={[styles.diagnosticRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Database Status:</Text>
                <Text style={[styles.diagVal, { color: colors.secondary }]}>Online</Text>
              </View>

              <View style={[styles.diagnosticRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Workspace Root:</Text>
                <Pressable 
                  onPress={() => Alert.alert('FileSystem Workspace Path', workspaceUri)}
                  style={({ pressed }) => [styles.pathButton, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Ionicons name="folder-open-outline" size={12} color={colors.primaryLight} style={{ marginRight: 4 }} />
                  <Text style={[styles.diagVal, styles.pathText, { color: colors.primaryLight }]} numberOfLines={1}>
                    {workspaceUri.split('/').slice(-3).join('/')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <Pressable 
            style={({ pressed }) => [styles.refreshBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={loadSettings}
          >
            <Ionicons name="refresh-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.refreshBtnText, { color: colors.textSecondary }]}>Refresh Diagnostics</Text>
          </Pressable>
        </View>

        <View style={[commonStyles.card, styles.sectionCard, { borderColor: colors.danger }]}>
          <View style={styles.row}>
            <Ionicons name="server-outline" size={18} color={colors.danger} style={styles.sectionIcon} />
            <Text style={[typography.subtitle, { fontSize: 15, color: colors.danger }]}>Danger Zone</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Wipe your entire SQLite database, screenshots attachments, and local exported files. The database schema will be rebuilt and pre-populated with standard dev templates.
          </Text>

          <Pressable 
            style={({ pressed }) => [styles.resetBtn, { borderColor: colors.danger, opacity: pressed ? 0.8 : 1 }]} 
            onPress={handleResetDatabase}
          >
            <Text style={[styles.resetBtnText, { color: colors.danger }]}>Wipe Database & Re-Seed</Text>
          </Pressable>
        </View>

        <Text style={[styles.footerText, { color: colors.textMuted }]}>DevSnippets Notes v1.0.0 • SQLite Offline Engine</Text>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  toggleThemeButton: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  keyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingRight: 10,
  },
  keyInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusVal: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  saveBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  diagnosticTable: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  diagLabel: {
    fontSize: 12,
  },
  diagVal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 150,
  },
  pathText: {
    fontWeight: 'bold',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  resetBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
