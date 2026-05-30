import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { fileSystemService, WorkspaceItem } from '../services/fileSystem';
import { getColors, AppTheme, getStyles, getTypography } from '../styles/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface FileManagerScreenProps {
  theme?: AppTheme;
}

export const FileManagerScreen: React.FC<FileManagerScreenProps> = ({ theme = 'dark' }) => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [loading, setLoading] = useState(true);

  
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);

  
  const [clipboard, setClipboard] = useState<{
    action: 'copy' | 'move';
    item: WorkspaceItem;
  } | null>(null);

  const colors = getColors(theme);
  const typography = getTypography(theme);
  const commonStyles = getStyles(theme);

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const list = await fileSystemService.listWorkspaceFiles(currentFolder);
      setItems(list);
    } catch (error) {
      console.error('Failed to list folder contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterFolder = (folderName: string) => {
    const nextPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setCurrentFolder(nextPath);
  };

  const handleGoUp = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentFolder.split('/');
    const nextPath = parts.slice(0, index + 1).join('/');
    setCurrentFolder(nextPath);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setLoading(true);
      setFolderModalVisible(false);
      const relativePath = currentFolder ? `${currentFolder}/${newFolderName}` : newFolderName;
      await fileSystemService.createFolder(relativePath);
      setNewFolderName('');
      await loadFiles();
    } catch (error) {
      Alert.alert('Error', 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    try {
      setLoading(true);
      setFileModalVisible(false);
      const relativePath = currentFolder ? `${currentFolder}/${newFileName}` : newFileName;
      await fileSystemService.createFile(relativePath, newFileContent);
      setNewFileName('');
      setNewFileContent('');
      await loadFiles();
    } catch (error) {
      Alert.alert('Error', 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (item: WorkspaceItem) => {
    try {
      setLoading(true);
      const content = await fileSystemService.readWorkspaceFile(item.path);
      setEditingItem(item);
      setEditorContent(content);
      setEditorVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Could not open file contents');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFileChanges = async () => {
    if (!editingItem) return;
    try {
      setLoading(true);
      await fileSystemService.createFile(editingItem.path, editorContent);
      setEditorVisible(false);
      setEditingItem(null);
      await loadFiles();
      Alert.alert('Saved', 'File written successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item: WorkspaceItem) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to permanently delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await fileSystemService.deleteItem(item.path);
              await loadFiles();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShareItem = async (item: WorkspaceItem) => {
    try {
      await fileSystemService.shareFile(item.path);
    } catch (error) {
      Alert.alert('Sharing Error', 'Failed to share file');
    }
  };

  const handleSetClipboard = (action: 'copy' | 'move', item: WorkspaceItem) => {
    setClipboard({ action, item });
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    try {
      setLoading(true);
      const destPath = currentFolder 
        ? `${currentFolder}/${clipboard.item.name}` 
        : clipboard.item.name;

      if (clipboard.action === 'copy') {
        await fileSystemService.copyItem(clipboard.item.path, destPath);
      } else {
        await fileSystemService.moveItem(clipboard.item.path, destPath);
      }

      setClipboard(null);
      await loadFiles();
    } catch (error) {
      Alert.alert('Paste Error', 'Failed to copy or move item to this directory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      {}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <View style={styles.row}>
          <Ionicons name="folder" size={20} color={colors.primaryLight} style={styles.headerIcon} />
          <Text style={[typography.subtitle, { fontSize: 20 }]}>File Workspace</Text>
        </View>
        
        <View style={styles.row}>
          <Pressable 
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => setFolderModalVisible(true)}
          >
            <MaterialCommunityIcons name="folder-plus-outline" size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable 
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => setFileModalVisible(true)}
          >
            <MaterialCommunityIcons name="file-plus-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {}
      <View style={[styles.breadcrumbBar, { backgroundColor: theme === 'dark' ? '#090D15' : '#E2E8F0', borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breadcrumbContent}>
          <Pressable 
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} 
            onPress={() => setCurrentFolder('')}
          >
            <Text style={[styles.breadcrumbItem, { color: colors.textMuted }, !currentFolder && { color: colors.primaryLight }]}>
              workspace
            </Text>
          </Pressable>
          {currentFolder ? (
            currentFolder.split('/').map((part, idx) => (
              <View key={idx} style={styles.row}>
                <Ionicons name="chevron-forward-outline" size={12} color={colors.textMuted} style={styles.breadcrumbArrow} />
                <Pressable 
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} 
                  onPress={() => handleBreadcrumbClick(idx)}
                >
                  <Text style={[
                    styles.breadcrumbItem, 
                    { color: colors.textMuted },
                    idx === currentFolder.split('/').length - 1 && { color: colors.primaryLight }
                  ]}>
                    {part}
                  </Text>
                </Pressable>
              </View>
            ))
          ) : null}
        </ScrollView>
      </View>

      {}
      {clipboard && (
        <View style={[styles.clipboardBanner, { backgroundColor: colors.primary }]}>
          <View style={styles.clipboardTextGroup}>
            <Ionicons name="clipboard-outline" size={14} color="#FFF" />
            <Text style={styles.clipboardMsg}>
              {clipboard.action === 'copy' ? 'Copying' : 'Moving'} "{clipboard.item.name}"
            </Text>
          </View>
          <View style={styles.row}>
            <Pressable 
              style={({ pressed }) => [styles.pasteBtn, { opacity: pressed ? 0.7 : 1 }]} 
              onPress={handlePaste}
            >
              <Text style={[styles.pasteText, { color: colors.primary }]}>Paste Here</Text>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [styles.cancelPasteBtn, { opacity: pressed ? 0.7 : 1 }]} 
              onPress={() => setClipboard(null)}
            >
              <Ionicons name="close" size={14} color="#FFF" />
            </Pressable>
          </View>
        </View>
      )}

      {}
      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={loadFiles}
          refreshing={loading}
          ListHeaderComponent={
            currentFolder ? (
              <Pressable 
                style={({ pressed }) => [styles.goUpItem, { opacity: pressed ? 0.7 : 1 }]} 
                onPress={handleGoUp}
              >
                <Ionicons name="arrow-up-outline" size={16} color={colors.primaryLight} style={styles.itemIcon} />
                <Text style={[styles.goUpText, { color: colors.primaryLight }]}>.. (Go Up)</Text>
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-outline" size={44} color={colors.textMuted} style={styles.emptyIcon} />
              <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: 6 }]}>This directory is empty</Text>
              <Text style={[typography.caption, { textAlign: 'center', maxWidth: 220, lineHeight: 16 }]}>
                Add files, folders, or export code snippets directly here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <Pressable
                style={({ pressed }) => [styles.itemMeta, { opacity: pressed ? 0.75 : 1 }]}
                onPress={() => (item.isDirectory ? handleEnterFolder(item.name) : handleOpenFile(item))}
              >
                {item.isDirectory ? (
                  <Ionicons name="folder" size={20} color="#F59E0B" style={styles.itemIcon} />
                ) : (
                  <Ionicons name="code-working-outline" size={20} color={colors.primaryLight} style={styles.itemIcon} />
                )}
                <View style={styles.itemTextContent}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  {!item.isDirectory && item.size !== undefined && (
                    <Text style={[styles.itemSize, { color: colors.textMuted }]}>{(item.size / 1024).toFixed(1)} KB</Text>
                  )}
                </View>
              </Pressable>

              {}
              <View style={styles.row}>
                <Pressable 
                  style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]} 
                  onPress={() => handleSetClipboard('copy', item)}
                >
                  <Ionicons name="copy-outline" size={14} color={colors.textSecondary} />
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]} 
                  onPress={() => handleSetClipboard('move', item)}
                >
                  <Ionicons name="move" size={14} color={colors.textSecondary} />
                </Pressable>
                {!item.isDirectory && (
                  <Pressable 
                    style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]} 
                    onPress={() => handleShareItem(item)}
                  >
                    <Ionicons name="share-social-outline" size={14} color={colors.primaryLight} />
                  </Pressable>
                )}
                <Pressable 
                  style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]} 
                  onPress={() => handleDeleteItem(item)}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={folderModalVisible}
        onRequestClose={() => setFolderModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[commonStyles.card, styles.dialogCard]}>
            <Text style={[typography.subtitle, styles.dialogTitle]}>New Folder</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Folder name"
              placeholderTextColor={colors.textMuted}
              autoFocus={true}
              value={newFolderName}
              onChangeText={setNewFolderName}
            />
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [styles.dialogCancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  setFolderModalVisible(false);
                  setNewFolderName('');
                }}
              >
                <Text style={[styles.dialogCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={({ pressed }) => [styles.dialogConfirmBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]} 
                onPress={handleCreateFolder}
              >
                <Text style={styles.dialogConfirmText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        animationType="fade"
        transparent={true}
        visible={fileModalVisible}
        onRequestClose={() => setFileModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[commonStyles.card, styles.dialogCard]}>
            <Text style={[typography.subtitle, styles.dialogTitle]}>New Code File</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g. index.js"
              placeholderTextColor={colors.textMuted}
              value={newFileName}
              onChangeText={setNewFileName}
            />
            <TextInput
              style={[commonStyles.input, styles.dialogCodeInput]}
              placeholder="// Enter file content..."
              placeholderTextColor={colors.textMuted}
              multiline={true}
              value={newFileContent}
              onChangeText={setNewFileContent}
            />
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [styles.dialogCancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  setFileModalVisible(false);
                  setNewFileName('');
                  setNewFileContent('');
                }}
              >
                <Text style={[styles.dialogCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={({ pressed }) => [styles.dialogConfirmBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]} 
                onPress={handleCreateFile}
              >
                <Text style={styles.dialogConfirmText}>Save File</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        animationType="slide"
        transparent={false}
        visible={editorVisible}
        onRequestClose={() => setEditorVisible(false)}
      >
        <View style={[commonStyles.container, { paddingTop: 20 }]}>
          <View style={[styles.editorHeader, { backgroundColor: theme === 'dark' ? '#070A10' : '#FFFFFF', borderBottomColor: colors.border }]}>
            <Pressable 
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              onPress={() => setEditorVisible(false)}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
            <Text style={[typography.subtitle, styles.editorTitle]} numberOfLines={1}>
              {editingItem?.name}
            </Text>
            <Pressable 
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              onPress={handleSaveFileChanges}
            >
              <Ionicons name="save-outline" size={20} color={colors.secondary} />
            </Pressable>
          </View>
          <TextInput
            style={[styles.editorTextInput, { backgroundColor: colors.codeBg, color: theme === 'dark' ? '#34D399' : '#047857' }]}
            multiline={true}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            value={editorContent}
            onChangeText={setEditorContent}
          />
        </View>
      </Modal>
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
  headerIcon: {
    marginRight: 8,
  },
  headerBtn: {
    padding: 8,
    marginLeft: 6,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbBar: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  breadcrumbContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  breadcrumbItem: {
    fontSize: 12,
    fontWeight: '600',
  },
  breadcrumbArrow: {
    marginHorizontal: 6,
  },
  clipboardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clipboardTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clipboardMsg: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 6,
  },
  pasteBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  pasteText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cancelPasteBtn: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  goUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  goUpText: {
    fontWeight: '600',
    fontSize: 13,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTextContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemSize: {
    fontSize: 10,
    marginTop: 2,
  },
  actionBtn: {
    padding: 6,
    marginHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 320,
  },
  dialogTitle: {
    fontSize: 16,
    marginBottom: 14,
  },
  dialogCodeInput: {
    height: 120,
    marginTop: 10,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  dialogCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  dialogCancelText: {
    fontSize: 13,
  },
  dialogConfirmBtn: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dialogConfirmText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  editorTitle: {
    fontSize: 15,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  editorTextInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    padding: 16,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
