import { getDatabase, generateId, getCurrentTimestamp } from './database';
import type {
  PersonBase,
  Player,
  Coach,
  Staff,
  School,
  PlayerRating,
  NILAgreement,
  Task,
  PlayerFull,
  CoachFull,
  StaffFull,
  PersonFull,
  SchoolWithCounts,
  CreatePlayerInput,
  CreateCoachInput,
  CreateStaffInput,
  SchoolInput,
  PlayerRatingInput,
  NILAgreementInput,
  TaskInput,
} from '../types/database';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse JSON array from database
 */
function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
}

/**
 * Stringify array to JSON for database
 */
function stringifyArray<T>(value: T[]): string {
  return JSON.stringify(value);
}

// ============================================================================
// School Operations
// ============================================================================

export function createSchool(input: SchoolInput): School {
  const db = getDatabase();
  const record_id = generateId();
  const now = getCurrentTimestamp();

  const stmt = db.prepare(`
    INSERT INTO schools (record_id, name, city, state, type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    record_id,
    input.name,
    input.city || null,
    input.state || null,
    stringifyArray(input.type),
    now,
    now
  );

  return getSchoolById(record_id)!;
}

export function getSchoolById(id: string): School | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM schools WHERE record_id = ?');
  const row = stmt.get(id) as any;

  if (!row) return undefined;

  return {
    record_id: row.record_id,
    name: row.name,
    city: row.city,
    state: row.state,
    type: parseJsonArray(row.type),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getAllSchools(): School[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM schools ORDER BY name');
  const rows = stmt.all() as any[];

  return rows.map((row) => ({
    record_id: row.record_id,
    name: row.name,
    city: row.city,
    state: row.state,
    type: parseJsonArray(row.type),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export function getAllSchoolsWithCounts(): SchoolWithCounts[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT
      s.*,
      COUNT(CASE WHEN p.type = 'player' THEN 1 END) as player_count,
      COUNT(CASE WHEN p.type = 'coach' THEN 1 END) as coach_count,
      COUNT(CASE WHEN p.type = 'staff' THEN 1 END) as staff_count
    FROM schools s
    LEFT JOIN people p ON s.record_id = p.school_id
    GROUP BY s.record_id
    ORDER BY s.name
  `);
  const rows = stmt.all() as any[];

  return rows.map((row) => ({
    record_id: row.record_id,
    name: row.name,
    city: row.city,
    state: row.state,
    type: parseJsonArray(row.type),
    created_at: row.created_at,
    updated_at: row.updated_at,
    player_count: row.player_count,
    coach_count: row.coach_count,
    staff_count: row.staff_count,
  }));
}

export function updateSchool(id: string, input: Partial<SchoolInput>): School | undefined {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.city !== undefined) {
    fields.push('city = ?');
    values.push(input.city);
  }
  if (input.state !== undefined) {
    fields.push('state = ?');
    values.push(input.state);
  }
  if (input.type !== undefined) {
    fields.push('type = ?');
    values.push(stringifyArray(input.type));
  }

  if (fields.length === 0) return getSchoolById(id);

  fields.push('updated_at = ?');
  values.push(getCurrentTimestamp());
  values.push(id);

  const stmt = db.prepare(`UPDATE schools SET ${fields.join(', ')} WHERE record_id = ?`);
  stmt.run(...values);

  return getSchoolById(id);
}

export function deleteSchool(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM schools WHERE record_id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============================================================================
// Player Operations
// ============================================================================

export function createPlayer(input: CreatePlayerInput): PlayerFull {
  const db = getDatabase();
  const person_id = generateId();
  const now = getCurrentTimestamp();

  // Insert into people table
  const personStmt = db.prepare(`
    INSERT INTO people (
      record_id, first_name, last_name, email, phone,
      twitter_url, linkedin_url, instagram_url, facebook_url, tiktok_url,
      type, school_id, assigned_coach_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  personStmt.run(
    person_id,
    input.person.first_name,
    input.person.last_name,
    input.person.email || null,
    input.person.phone || null,
    input.person.twitter_url || null,
    input.person.linkedin_url || null,
    input.person.instagram_url || null,
    input.person.facebook_url || null,
    input.person.tiktok_url || null,
    'player',
    input.person.school_id || null,
    input.person.assigned_coach_id || null,
    now,
    now
  );

  // Insert into players table
  const playerStmt = db.prepare(`
    INSERT INTO players (person_id, position, grad_year, years_eligibility, priority, likelihood)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  playerStmt.run(
    person_id,
    stringifyArray(input.player.position || []),
    input.player.grad_year || null,
    input.player.years_eligibility || null,
    input.player.priority || null,
    input.player.likelihood || null
  );

  // Insert rating if provided
  if (input.rating) {
    const ratingStmt = db.prepare(`
      INSERT INTO player_ratings (record_id, player_id, maxpreps, rating_247, composite_247, internal_rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    ratingStmt.run(
      generateId(),
      person_id,
      input.rating.maxpreps || null,
      input.rating.rating_247 || null,
      input.rating.composite_247 || null,
      input.rating.internal_rating || null,
      now,
      now
    );
  }

  // Insert NIL agreement if provided
  if (input.nil_agreement) {
    const nilStmt = db.prepare(`
      INSERT INTO nil_agreements (record_id, player_id, committed_nil, estimated_nil, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    nilStmt.run(
      generateId(),
      person_id,
      input.nil_agreement.committed_nil || null,
      input.nil_agreement.estimated_nil || null,
      now,
      now
    );
  }

  return getPlayerById(person_id)!;
}

export function getPlayerById(id: string): PlayerFull | undefined {
  const db = getDatabase();

  // Get person and player data
  const stmt = db.prepare(`
    SELECT p.*, pl.*
    FROM people p
    JOIN players pl ON p.record_id = pl.person_id
    WHERE p.record_id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return undefined;

  // Get rating
  const ratingStmt = db.prepare('SELECT * FROM player_ratings WHERE player_id = ?');
  const ratingRow = ratingStmt.get(id) as any;

  // Get NIL agreement (get the most recent one)
  const nilStmt = db.prepare('SELECT * FROM nil_agreements WHERE player_id = ? ORDER BY created_at DESC LIMIT 1');
  const nilRow = nilStmt.get(id) as any;

  // Get school if exists
  let school: School | undefined;
  if (row.school_id) {
    school = getSchoolById(row.school_id);
  }

  // Get assigned coach if exists
  let assigned_coach: CoachFull | undefined;
  if (row.assigned_coach_id) {
    assigned_coach = getCoachById(row.assigned_coach_id);
  }

  // Get tasks
  const tasks = getTasksByPersonId(id);

  return {
    record_id: row.record_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    twitter_url: row.twitter_url,
    linkedin_url: row.linkedin_url,
    instagram_url: row.instagram_url,
    facebook_url: row.facebook_url,
    tiktok_url: row.tiktok_url,
    type: 'player',
    school_id: row.school_id,
    assigned_coach_id: row.assigned_coach_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    player: {
      person_id: row.person_id,
      position: parseJsonArray(row.position),
      grad_year: row.grad_year,
      years_eligibility: row.years_eligibility,
      priority: row.priority,
      likelihood: row.likelihood,
    },
    rating: ratingRow ? {
      record_id: ratingRow.record_id,
      player_id: ratingRow.player_id,
      maxpreps: ratingRow.maxpreps,
      rating_247: ratingRow.rating_247,
      composite_247: ratingRow.composite_247,
      internal_rating: ratingRow.internal_rating,
      created_at: ratingRow.created_at,
      updated_at: ratingRow.updated_at,
    } : undefined,
    nil_agreement: nilRow ? {
      record_id: nilRow.record_id,
      player_id: nilRow.player_id,
      committed_nil: nilRow.committed_nil,
      estimated_nil: nilRow.estimated_nil,
      created_at: nilRow.created_at,
      updated_at: nilRow.updated_at,
    } : undefined,
    school,
    assigned_coach,
    tasks,
  };
}

export function getAllPlayers(): PlayerFull[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT p.record_id
    FROM people p
    JOIN players pl ON p.record_id = pl.person_id
    ORDER BY p.last_name, p.first_name
  `);
  const rows = stmt.all() as any[];

  return rows.map((row) => getPlayerById(row.record_id)!).filter(Boolean);
}

export function deletePlayer(id: string): boolean {
  const db = getDatabase();
  // Cascade delete will handle players, ratings, nil_agreements, tasks
  const stmt = db.prepare('DELETE FROM people WHERE record_id = ? AND type = ?');
  const result = stmt.run(id, 'player');
  return result.changes > 0;
}

// ============================================================================
// Coach Operations
// ============================================================================

export function createCoach(input: CreateCoachInput): CoachFull {
  const db = getDatabase();
  const person_id = generateId();
  const now = getCurrentTimestamp();

  // Insert into people table
  const personStmt = db.prepare(`
    INSERT INTO people (
      record_id, first_name, last_name, email, phone,
      twitter_url, linkedin_url, instagram_url, facebook_url, tiktok_url,
      type, school_id, assigned_coach_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  personStmt.run(
    person_id,
    input.person.first_name,
    input.person.last_name,
    input.person.email || null,
    input.person.phone || null,
    input.person.twitter_url || null,
    input.person.linkedin_url || null,
    input.person.instagram_url || null,
    input.person.facebook_url || null,
    input.person.tiktok_url || null,
    'coach',
    input.person.school_id || null,
    input.person.assigned_coach_id || null,
    now,
    now
  );

  // Insert into coaches table
  const coachStmt = db.prepare(`
    INSERT INTO coaches (person_id, specialty, committed_salary, estimated_salary)
    VALUES (?, ?, ?, ?)
  `);

  coachStmt.run(
    person_id,
    stringifyArray(input.coach.specialty || []),
    input.coach.committed_salary || null,
    input.coach.estimated_salary || null
  );

  return getCoachById(person_id)!;
}

export function getCoachById(id: string): CoachFull | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT p.*, c.*
    FROM people p
    JOIN coaches c ON p.record_id = c.person_id
    WHERE p.record_id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return undefined;

  let school: School | undefined;
  if (row.school_id) {
    school = getSchoolById(row.school_id);
  }

  const tasks = getTasksByPersonId(id);

  return {
    record_id: row.record_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    twitter_url: row.twitter_url,
    linkedin_url: row.linkedin_url,
    instagram_url: row.instagram_url,
    facebook_url: row.facebook_url,
    tiktok_url: row.tiktok_url,
    type: 'coach',
    school_id: row.school_id,
    assigned_coach_id: row.assigned_coach_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    coach: {
      person_id: row.person_id,
      specialty: parseJsonArray(row.specialty),
      committed_salary: row.committed_salary,
      estimated_salary: row.estimated_salary,
    },
    school,
    tasks,
  };
}

export function getAllCoaches(): CoachFull[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT p.record_id
    FROM people p
    JOIN coaches c ON p.record_id = c.person_id
    ORDER BY p.last_name, p.first_name
  `);
  const rows = stmt.all() as any[];

  return rows.map((row) => getCoachById(row.record_id)!).filter(Boolean);
}

export function deleteCoach(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM people WHERE record_id = ? AND type = ?');
  const result = stmt.run(id, 'coach');
  return result.changes > 0;
}

// ============================================================================
// Staff Operations
// ============================================================================

export function createStaff(input: CreateStaffInput): StaffFull {
  const db = getDatabase();
  const person_id = generateId();
  const now = getCurrentTimestamp();

  const personStmt = db.prepare(`
    INSERT INTO people (
      record_id, first_name, last_name, email, phone,
      twitter_url, linkedin_url, instagram_url, facebook_url, tiktok_url,
      type, school_id, assigned_coach_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  personStmt.run(
    person_id,
    input.person.first_name,
    input.person.last_name,
    input.person.email || null,
    input.person.phone || null,
    input.person.twitter_url || null,
    input.person.linkedin_url || null,
    input.person.instagram_url || null,
    input.person.facebook_url || null,
    input.person.tiktok_url || null,
    'staff',
    input.person.school_id || null,
    input.person.assigned_coach_id || null,
    now,
    now
  );

  const staffStmt = db.prepare(`
    INSERT INTO staff (person_id, specialty)
    VALUES (?, ?)
  `);

  staffStmt.run(
    person_id,
    stringifyArray(input.staff.specialty || [])
  );

  return getStaffById(person_id)!;
}

export function getStaffById(id: string): StaffFull | undefined {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT p.*, s.*
    FROM people p
    JOIN staff s ON p.record_id = s.person_id
    WHERE p.record_id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return undefined;

  let school: School | undefined;
  if (row.school_id) {
    school = getSchoolById(row.school_id);
  }

  const tasks = getTasksByPersonId(id);

  return {
    record_id: row.record_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    twitter_url: row.twitter_url,
    linkedin_url: row.linkedin_url,
    instagram_url: row.instagram_url,
    facebook_url: row.facebook_url,
    tiktok_url: row.tiktok_url,
    type: 'staff',
    school_id: row.school_id,
    assigned_coach_id: row.assigned_coach_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    staff: {
      person_id: row.person_id,
      specialty: parseJsonArray(row.specialty),
    },
    school,
    tasks,
  };
}

export function getAllStaff(): StaffFull[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT p.record_id
    FROM people p
    JOIN staff s ON p.record_id = s.person_id
    ORDER BY p.last_name, p.first_name
  `);
  const rows = stmt.all() as any[];

  return rows.map((row) => getStaffById(row.record_id)!).filter(Boolean);
}

export function deleteStaff(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM people WHERE record_id = ? AND type = ?');
  const result = stmt.run(id, 'staff');
  return result.changes > 0;
}

// ============================================================================
// Generic Person Operations
// ============================================================================

export function getAllPeople(): PersonFull[] {
  return [...getAllPlayers(), ...getAllCoaches(), ...getAllStaff()];
}

export function getPersonById(id: string): PersonFull | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT type FROM people WHERE record_id = ?');
  const row = stmt.get(id) as any;

  if (!row) return undefined;

  switch (row.type) {
    case 'player':
      return getPlayerById(id);
    case 'coach':
      return getCoachById(id);
    case 'staff':
      return getStaffById(id);
    default:
      return undefined;
  }
}

export function deletePerson(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM people WHERE record_id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============================================================================
// Task Operations
// ============================================================================

export function createTask(input: TaskInput): Task {
  const db = getDatabase();
  const record_id = generateId();
  const now = getCurrentTimestamp();

  const stmt = db.prepare(`
    INSERT INTO tasks (record_id, person_id, status, due_date, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    record_id,
    input.person_id,
    input.status,
    input.due_date || null,
    input.description,
    now,
    now
  );

  return getTaskById(record_id)!;
}

export function getTaskById(id: string): Task | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks WHERE record_id = ?');
  const row = stmt.get(id) as any;

  if (!row) return undefined;

  return {
    record_id: row.record_id,
    person_id: row.person_id,
    status: row.status,
    due_date: row.due_date,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getTasksByPersonId(person_id: string): Task[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks WHERE person_id = ? ORDER BY due_date, created_at');
  const rows = stmt.all(person_id) as any[];

  return rows.map((row) => ({
    record_id: row.record_id,
    person_id: row.person_id,
    status: row.status,
    due_date: row.due_date,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export function updateTask(id: string, input: Partial<TaskInput>): Task | undefined {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (input.status !== undefined) {
    fields.push('status = ?');
    values.push(input.status);
  }
  if (input.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(input.due_date);
  }
  if (input.description !== undefined) {
    fields.push('description = ?');
    values.push(input.description);
  }

  if (fields.length === 0) return getTaskById(id);

  fields.push('updated_at = ?');
  values.push(getCurrentTimestamp());
  values.push(id);

  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE record_id = ?`);
  stmt.run(...values);

  return getTaskById(id);
}

export function deleteTask(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM tasks WHERE record_id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============================================================================
// Player Rating Operations
// ============================================================================

export function updatePlayerRating(player_id: string, input: Partial<Omit<PlayerRatingInput, 'player_id'>>): PlayerRating {
  const db = getDatabase();

  // Check if rating exists
  const existingStmt = db.prepare('SELECT record_id FROM player_ratings WHERE player_id = ?');
  const existing = existingStmt.get(player_id) as any;

  if (existing) {
    // Update existing rating
    const fields: string[] = [];
    const values: any[] = [];

    if (input.maxpreps !== undefined) {
      fields.push('maxpreps = ?');
      values.push(input.maxpreps);
    }
    if (input.rating_247 !== undefined) {
      fields.push('rating_247 = ?');
      values.push(input.rating_247);
    }
    if (input.composite_247 !== undefined) {
      fields.push('composite_247 = ?');
      values.push(input.composite_247);
    }
    if (input.internal_rating !== undefined) {
      fields.push('internal_rating = ?');
      values.push(input.internal_rating);
    }

    fields.push('updated_at = ?');
    values.push(getCurrentTimestamp());
    values.push(player_id);

    const updateStmt = db.prepare(`UPDATE player_ratings SET ${fields.join(', ')} WHERE player_id = ?`);
    updateStmt.run(...values);
  } else {
    // Create new rating
    const record_id = generateId();
    const now = getCurrentTimestamp();

    const insertStmt = db.prepare(`
      INSERT INTO player_ratings (record_id, player_id, maxpreps, rating_247, composite_247, internal_rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      record_id,
      player_id,
      input.maxpreps || null,
      input.rating_247 || null,
      input.composite_247 || null,
      input.internal_rating || null,
      now,
      now
    );
  }

  const getStmt = db.prepare('SELECT * FROM player_ratings WHERE player_id = ?');
  const row = getStmt.get(player_id) as any;

  return {
    record_id: row.record_id,
    player_id: row.player_id,
    maxpreps: row.maxpreps,
    rating_247: row.rating_247,
    composite_247: row.composite_247,
    internal_rating: row.internal_rating,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ============================================================================
// NIL Agreement Operations
// ============================================================================

export function updateNILAgreement(player_id: string, input: Partial<Omit<NILAgreementInput, 'player_id'>>): NILAgreement {
  const db = getDatabase();

  // Get most recent NIL agreement
  const existingStmt = db.prepare('SELECT record_id FROM nil_agreements WHERE player_id = ? ORDER BY created_at DESC LIMIT 1');
  const existing = existingStmt.get(player_id) as any;

  if (existing) {
    // Update existing agreement
    const fields: string[] = [];
    const values: any[] = [];

    if (input.committed_nil !== undefined) {
      fields.push('committed_nil = ?');
      values.push(input.committed_nil);
    }
    if (input.estimated_nil !== undefined) {
      fields.push('estimated_nil = ?');
      values.push(input.estimated_nil);
    }

    fields.push('updated_at = ?');
    values.push(getCurrentTimestamp());
    values.push(existing.record_id);

    const updateStmt = db.prepare(`UPDATE nil_agreements SET ${fields.join(', ')} WHERE record_id = ?`);
    updateStmt.run(...values);
  } else {
    // Create new agreement
    const record_id = generateId();
    const now = getCurrentTimestamp();

    const insertStmt = db.prepare(`
      INSERT INTO nil_agreements (record_id, player_id, committed_nil, estimated_nil, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      record_id,
      player_id,
      input.committed_nil || null,
      input.estimated_nil || null,
      now,
      now
    );
  }

  const getStmt = db.prepare('SELECT * FROM nil_agreements WHERE player_id = ? ORDER BY created_at DESC LIMIT 1');
  const row = getStmt.get(player_id) as any;

  return {
    record_id: row.record_id,
    player_id: row.player_id,
    committed_nil: row.committed_nil,
    estimated_nil: row.estimated_nil,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
