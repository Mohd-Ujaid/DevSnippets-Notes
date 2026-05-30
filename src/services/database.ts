import * as SQLite from 'expo-sqlite';

export interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: string; 
  is_favorite: number; 
  screenshot_path: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const DATABASE_NAME = 'dev_snippets.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const databaseService = {
  
  getDatabase(): SQLite.SQLiteDatabase {
    if (!dbInstance) {
      dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
    }
    return dbInstance;
  },

  
  async initDatabase(): Promise<void> {
    try {
      const db = this.getDatabase();
      
      
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS snippets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          tags TEXT,
          is_favorite INTEGER DEFAULT 0,
          screenshot_path TEXT,
          description TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      
      try {
        await db.execAsync(`ALTER TABLE snippets ADD COLUMN description TEXT;`);
        console.log('Successfully upgraded database table to support description notes');
      } catch (e) {
        
      }
      console.log('SQLite Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  },

  
  async createSnippet(
    title: string,
    code: string,
    language: string,
    tags: string = '',
    isFavorite: boolean = false,
    screenshotPath: string | null = null,
    description: string = ''
  ): Promise<number> {
    try {
      const db = this.getDatabase();
      const isFavVal = isFavorite ? 1 : 0;
      
      const result = await db.runAsync(
        `INSERT INTO snippets (title, code, language, tags, is_favorite, screenshot_path, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [title, code, language, tags, isFavVal, screenshotPath, description]
      );
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error inserting snippet:', error);
      throw error;
    }
  },

  
  async getAllSnippets(): Promise<Snippet[]> {
    try {
      const db = this.getDatabase();
      const rows = await db.getAllAsync<Snippet>('SELECT * FROM snippets ORDER BY created_at DESC;');
      return rows;
    } catch (error) {
      console.error('Error fetching all snippets:', error);
      return [];
    }
  },

  
  async searchSnippets(query: string): Promise<Snippet[]> {
    try {
      const db = this.getDatabase();
      if (!query.trim()) {
        return this.getAllSnippets();
      }
      
      const searchPattern = `%${query}%`;
      const rows = await db.getAllAsync<Snippet>(
        `SELECT * FROM snippets 
         WHERE title LIKE ? 
            OR code LIKE ? 
            OR tags LIKE ? 
            OR language LIKE ? 
         ORDER BY created_at DESC;`,
        [searchPattern, searchPattern, searchPattern, searchPattern]
      );
      return rows;
    } catch (error) {
      console.error('Error searching snippets:', error);
      return [];
    }
  },

  
  async getSnippetById(id: number): Promise<Snippet | null> {
    try {
      const db = this.getDatabase();
      const row = await db.getFirstAsync<Snippet>('SELECT * FROM snippets WHERE id = ?;', [id]);
      return row;
    } catch (error) {
      console.error(`Error getting snippet with ID ${id}:`, error);
      return null;
    }
  },

  
  async getFavoriteSnippets(): Promise<Snippet[]> {
    try {
      const db = this.getDatabase();
      const rows = await db.getAllAsync<Snippet>(
        'SELECT * FROM snippets WHERE is_favorite = 1 ORDER BY created_at DESC;'
      );
      return rows;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  
  async updateSnippet(
    id: number,
    title: string,
    code: string,
    language: string,
    tags: string = '',
    isFavorite: boolean = false,
    screenshotPath: string | null = null,
    description: string = ''
  ): Promise<void> {
    try {
      const db = this.getDatabase();
      const isFavVal = isFavorite ? 1 : 0;
      
      await db.runAsync(
        `UPDATE snippets 
         SET title = ?, code = ?, language = ?, tags = ?, is_favorite = ?, screenshot_path = ?, description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?;`,
         [title, code, language, tags, isFavVal, screenshotPath, description, id]
      );
    } catch (error) {
      console.error(`Error updating snippet ID ${id}:`, error);
      throw error;
    }
  },

  
  async toggleFavorite(id: number, currentStatus: number): Promise<number> {
    try {
      const db = this.getDatabase();
      const nextStatus = currentStatus === 1 ? 0 : 1;
      
      await db.runAsync(
        'UPDATE snippets SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;',
        [nextStatus, id]
      );
      
      return nextStatus;
    } catch (error) {
      console.error(`Error toggling favorite for ID ${id}:`, error);
      throw error;
    }
  },


  
  async deleteSnippet(id: number): Promise<void> {
    try {
      const db = this.getDatabase();
      await db.runAsync('DELETE FROM snippets WHERE id = ?;', [id]);
    } catch (error) {
      console.error(`Error deleting snippet with ID ${id}:`, error);
      throw error;
    }
  },

  
  async getRowCount(): Promise<number> {
    try {
      const db = this.getDatabase();
      const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM snippets;');
      return result ? result.count : 0;
    } catch (error) {
      console.error('Error counting database rows:', error);
      return 0;
    }
  }
};
