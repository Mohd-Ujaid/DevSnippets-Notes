import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';


export const ATTACHMENTS_DIR = `${FileSystem.documentDirectory}attachments/`;


export const FILES_WORKSPACE_DIR = `${FileSystem.documentDirectory}files/`;

export interface WorkspaceItem {
  name: string;
  path: string; 
  uri: string;  
  isDirectory: boolean;
  size?: number;
  updatedAt?: number;
}

export const fileSystemService = {
  
  async initDirectories(): Promise<void> {
    try {
      const attachmentsInfo = await FileSystem.getInfoAsync(ATTACHMENTS_DIR);
      if (!attachmentsInfo.exists) {
        await FileSystem.makeDirectoryAsync(ATTACHMENTS_DIR, { intermediates: true });
      }

      const filesWorkspaceInfo = await FileSystem.getInfoAsync(FILES_WORKSPACE_DIR);
      if (!filesWorkspaceInfo.exists) {
        await FileSystem.makeDirectoryAsync(FILES_WORKSPACE_DIR, { intermediates: true });
        
        
        await this.seedDefaultTemplates();
      }
    } catch (error) {
      console.error('Error initializing FileSystem directories:', error);
    }
  },

  
  async seedDefaultTemplates(): Promise<void> {
    try {
      
      await this.createFolder('templates');
      await this.createFolder('utilities');

      
      await this.createFile(
        'templates/react-component.js',
        `import React from 'react';\nimport { StyleSheet, Text, View } from 'react-native';\n\nexport default function CustomCard({ title, children }) {\n  return (\n    <View style={styles.card}>\n      <Text style={styles.title}>{title}</Text>\n      {children}\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: {\n    backgroundColor: '#1E293B',\n    padding: 16,\n    borderRadius: 8,\n    borderWidth: 1,\n    borderColor: '#334155',\n  },\n  title: {\n    color: '#F8FAFC',\n    fontSize: 18,\n    fontWeight: 'bold',\n    marginBottom: 8,\n  },\n});`
      );

      await this.createFile(
        'utilities/fetch-api.js',
        `/**\n * Premium lightweight fetch helper\n */\nexport async function request(url, options = {}) {\n  const headers = {\n    'Content-Type': 'application/json',\n    ...options.headers,\n  };\n\n  try {\n    const response = await fetch(url, { ...options, headers });\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  } catch (error) {\n    console.error('API request failed:', error);\n    throw error;\n  }\n}`
      );

      await this.createFile(
        'readme.txt',
        `Welcome to DevSnippets Local Workspace!\n\nThis folder holds your local code files, screenshots, and downloaded templates.\nYou can browse, move, edit, delete, and share these resources offline.`
      );
    } catch (error) {
      console.error('Error seeding default templates:', error);
    }
  },

  
  async saveAttachment(tempUri: string): Promise<string> {
    try {
      await this.initDirectories();
      const fileName = `screenshot_${Date.now()}.png`;
      const destinationUri = `${ATTACHMENTS_DIR}${fileName}`;
      await FileSystem.copyAsync({
        from: tempUri,
        to: destinationUri
      });
      return destinationUri;
    } catch (error) {
      console.error('Error saving image attachment:', error);
      throw error;
    }
  },

  
  async deleteAttachment(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error deleting screenshot attachment:', error);
    }
  },

  
  async createFolder(relativePath: string): Promise<void> {
    try {
      await this.initDirectories();
      const folderUri = `${FILES_WORKSPACE_DIR}${relativePath}`;
      await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
    } catch (error) {
      console.error(`Error creating folder "${relativePath}":`, error);
      throw error;
    }
  },

  
  async createFile(relativePath: string, content: string): Promise<void> {
    try {
      await this.initDirectories();
      const fileUri = `${FILES_WORKSPACE_DIR}${relativePath}`;
      
      
      const parts = relativePath.split('/');
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/');
        await this.createFolder(parentPath);
      }
      
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8
      });
    } catch (error) {
      console.error(`Error creating file "${relativePath}":`, error);
      throw error;
    }
  },

  
  async readWorkspaceFile(relativePath: string): Promise<string> {
    try {
      const fileUri = `${FILES_WORKSPACE_DIR}${relativePath}`;
      return await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8
      });
    } catch (error) {
      console.error(`Error reading file "${relativePath}":`, error);
      throw error;
    }
  },

  
  async deleteItem(relativePath: string): Promise<void> {
    try {
      const itemUri = `${FILES_WORKSPACE_DIR}${relativePath}`;
      const info = await FileSystem.getInfoAsync(itemUri);
      if (info.exists) {
        await FileSystem.deleteAsync(itemUri);
      }
    } catch (error) {
      console.error(`Error deleting item "${relativePath}":`, error);
      throw error;
    }
  },

  
  async moveItem(fromRelativePath: string, toRelativePath: string): Promise<void> {
    try {
      const sourceUri = `${FILES_WORKSPACE_DIR}${fromRelativePath}`;
      const destUri = `${FILES_WORKSPACE_DIR}${toRelativePath}`;
      
      
      const parts = toRelativePath.split('/');
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/');
        await this.createFolder(parentPath);
      }
      
      await FileSystem.moveAsync({
        from: sourceUri,
        to: destUri
      });
    } catch (error) {
      console.error(`Error moving item from "${fromRelativePath}" to "${toRelativePath}":`, error);
      throw error;
    }
  },

  
  async copyItem(fromRelativePath: string, toRelativePath: string): Promise<void> {
    try {
      const sourceUri = `${FILES_WORKSPACE_DIR}${fromRelativePath}`;
      const destUri = `${FILES_WORKSPACE_DIR}${toRelativePath}`;
      
      
      const parts = toRelativePath.split('/');
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/');
        await this.createFolder(parentPath);
      }

      await FileSystem.copyAsync({
        from: sourceUri,
        to: destUri
      });
    } catch (error) {
      console.error(`Error copying item from "${fromRelativePath}" to "${toRelativePath}":`, error);
      throw error;
    }
  },

  
  async listWorkspaceFiles(currentRelativeFolder: string = ''): Promise<WorkspaceItem[]> {
    try {
      await this.initDirectories();
      const folderUri = currentRelativeFolder 
        ? `${FILES_WORKSPACE_DIR}${currentRelativeFolder}/`
        : FILES_WORKSPACE_DIR;

      const files = await FileSystem.readDirectoryAsync(folderUri);
      const items: WorkspaceItem[] = [];

      for (const name of files) {
        const relativePath = currentRelativeFolder ? `${currentRelativeFolder}/${name}` : name;
        const fullUri = `${folderUri}${name}`;
        const info = await FileSystem.getInfoAsync(fullUri);

        if (info.exists) {
          items.push({
            name,
            path: relativePath,
            uri: fullUri,
            isDirectory: info.isDirectory,
            size: info.size,
            updatedAt: info.modificationTime
          });
        }
      }

      
      return items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error(`Error listing files in folder "${currentRelativeFolder}":`, error);
      return [];
    }
  },

  
  async shareFile(relativePath: string): Promise<void> {
    try {
      const fileUri = `${FILES_WORKSPACE_DIR}${relativePath}`;
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error('Sharing is not available on this platform');
      }
      
      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Share ${relativePath.split('/').pop()}`
      });
    } catch (error) {
      console.error(`Error sharing file "${relativePath}":`, error);
      throw error;
    }
  }
};
