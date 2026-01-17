import Database from 'better-sqlite3';
import path from 'path';

// ============================================================================
// Database Connection & Initialization
// ============================================================================

let db: Database.Database | null = null;

/**
 * Get or create database connection
 */
export function getDatabase(): Database.Database {
  if (db) return db;

  // Create database file in project root
  const dbPath = path.join(process.cwd(), 'recruiting.sqlite');
  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Initialize schema if needed
  initializeSchema(db);

  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Initialize database schema
 */
function initializeSchema(db: Database.Database): void {
  // Create tables in correct order (respecting foreign key dependencies)

  // 1. Schools table (no dependencies)
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      record_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT,
      state TEXT,
      type TEXT NOT NULL, -- JSON array of school types
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. People table (base table, references schools)
  db.exec(`
    CREATE TABLE IF NOT EXISTS people (
      record_id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      twitter_url TEXT,
      linkedin_url TEXT,
      instagram_url TEXT,
      facebook_url TEXT,
      tiktok_url TEXT,
      type TEXT NOT NULL CHECK(type IN ('player', 'coach', 'staff')),
      school_id TEXT,
      assigned_coach_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (school_id) REFERENCES schools(record_id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_coach_id) REFERENCES people(record_id) ON DELETE SET NULL
    );
  `);

  // 3. Players table (extends people)
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      person_id TEXT PRIMARY KEY,
      position TEXT NOT NULL, -- JSON array of positions
      grad_year INTEGER,
      years_eligibility INTEGER,
      priority INTEGER CHECK(priority BETWEEN 1 AND 5),
      likelihood INTEGER CHECK(likelihood BETWEEN 1 AND 5),
      FOREIGN KEY (person_id) REFERENCES people(record_id) ON DELETE CASCADE
    );
  `);

  // 4. Coaches table (extends people)
  db.exec(`
    CREATE TABLE IF NOT EXISTS coaches (
      person_id TEXT PRIMARY KEY,
      specialty TEXT NOT NULL, -- JSON array of specialties
      committed_salary REAL,
      estimated_salary REAL,
      FOREIGN KEY (person_id) REFERENCES people(record_id) ON DELETE CASCADE
    );
  `);

  // 5. Staff table (extends people)
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      person_id TEXT PRIMARY KEY,
      specialty TEXT NOT NULL, -- JSON array of specialties
      FOREIGN KEY (person_id) REFERENCES people(record_id) ON DELETE CASCADE
    );
  `);

  // 6. Player Ratings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_ratings (
      record_id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL UNIQUE,
      maxpreps INTEGER CHECK(maxpreps BETWEEN 1 AND 5),
      rating_247 INTEGER CHECK(rating_247 BETWEEN 1 AND 5),
      composite_247 REAL,
      internal_rating INTEGER CHECK(internal_rating BETWEEN 1 AND 5),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(person_id) ON DELETE CASCADE
    );
  `);

  // 7. NIL Agreements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nil_agreements (
      record_id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      committed_nil REAL,
      estimated_nil REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(person_id) ON DELETE CASCADE
    );
  `);

  // 8. Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      record_id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Not Started', 'In Progress', 'Complete')),
      due_date TEXT,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (person_id) REFERENCES people(record_id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_people_type ON people(type);
    CREATE INDEX IF NOT EXISTS idx_people_school_id ON people(school_id);
    CREATE INDEX IF NOT EXISTS idx_people_assigned_coach_id ON people(assigned_coach_id);
    CREATE INDEX IF NOT EXISTS idx_player_ratings_player_id ON player_ratings(player_id);
    CREATE INDEX IF NOT EXISTS idx_nil_agreements_player_id ON nil_agreements(player_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_person_id ON tasks(person_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
