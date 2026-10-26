import Database from 'better-sqlite3';
import path from 'path';
import { DATA_DIR } from './db.js';

export const db = new Database(path.join(DATA_DIR, 'autopost.db'));

// Initialize Database Schemas
db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT,
  brand TEXT,
  tone TEXT,
  platforms TEXT,           
  captions TEXT,            
  hashtags TEXT,            
  script TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  platforms TEXT,
  caption TEXT,
  hashtags TEXT,
  image_url TEXT,
  video_path TEXT,
  scheduled_time DATETIME,
  status TEXT DEFAULT 'pending',
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

console.log('[SPA ENTERPRISE] Social Media SQLite Database Initialized.');
