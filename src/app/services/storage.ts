/**
 * Storage Layer - Provides data persistence for MVP
 *
 * For local MVP demo, we'll use IndexedDB (browser-based database)
 * which provides similar functionality to SQLite but works in the browser.
 *
 * This can be easily swapped for a real backend API later.
 */

import type {
  PersonFull,
  PlayerFull,
  CoachFull,
  StaffFull,
  School,
  SchoolWithCounts,
  Task,
  CreatePlayerInput,
  CreateCoachInput,
  CreateStaffInput,
  SchoolInput,
  TaskInput,
  ExternalNILDeal,
  ExternalNILDealInput,
  InstitutionalAllocation,
  InstitutionalAllocationInput,
  FundingPool,
  FundingPoolInput,
} from '../types/database';

const DB_NAME = 'recruiting_crm';
const DB_VERSION = 2; // Incremented for NIL system redesign

let db: IDBDatabase | null = null;

// ============================================================================
// Database Initialization
// ============================================================================

export async function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores (tables)
      if (!db.objectStoreNames.contains('people')) {
        const peopleStore = db.createObjectStore('people', { keyPath: 'record_id' });
        peopleStore.createIndex('type', 'type', { unique: false });
        peopleStore.createIndex('school_id', 'school_id', { unique: false });
      }

      if (!db.objectStoreNames.contains('schools')) {
        db.createObjectStore('schools', { keyPath: 'record_id' });
      }

      if (!db.objectStoreNames.contains('tasks')) {
        const tasksStore = db.createObjectStore('tasks', { keyPath: 'record_id' });
        tasksStore.createIndex('person_id', 'person_id', { unique: false });
      }

      // New NIL system object stores
      if (!db.objectStoreNames.contains('external_nil_deals')) {
        const nilDealsStore = db.createObjectStore('external_nil_deals', { keyPath: 'record_id' });
        nilDealsStore.createIndex('player_id', 'player_id', { unique: false });
      }

      if (!db.objectStoreNames.contains('institutional_allocations')) {
        const allocationsStore = db.createObjectStore('institutional_allocations', { keyPath: 'record_id' });
        allocationsStore.createIndex('player_id', 'player_id', { unique: false });
      }

      if (!db.objectStoreNames.contains('funding_pools')) {
        db.createObjectStore('funding_pools', { keyPath: 'record_id' });
      }
    };
  });
}

function getDB(): IDBDatabase {
  if (!db) throw new Error('Database not initialized');
  return db;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

async function getFromStore<T>(storeName: string, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putInStore<T>(storeName: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getByIndex<T>(storeName: string, indexName: string, key: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// School Operations
// ============================================================================

export async function createSchool(input: SchoolInput): Promise<School> {
  const school: School = {
    record_id: generateId(),
    name: input.name,
    city: input.city,
    state: input.state,
    type: input.type,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('schools', school);
  return school;
}

export async function getSchoolById(id: string): Promise<School | undefined> {
  return getFromStore<School>('schools', id);
}

export async function getAllSchools(): Promise<School[]> {
  const schools = await getAllFromStore<School>('schools');
  return schools.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllSchoolsWithCounts(): Promise<SchoolWithCounts[]> {
  const schools = await getAllSchools();
  const people = await getAllPeople();

  return schools.map((school) => {
    const schoolPeople = people.filter((p) => p.school_id === school.record_id);
    return {
      ...school,
      player_count: schoolPeople.filter((p) => p.type === 'player').length,
      coach_count: schoolPeople.filter((p) => p.type === 'coach').length,
      staff_count: schoolPeople.filter((p) => p.type === 'staff').length,
    };
  });
}

export async function updateSchool(id: string, input: Partial<SchoolInput>): Promise<School | undefined> {
  const existing = await getSchoolById(id);
  if (!existing) return undefined;

  const updated: School = {
    ...existing,
    ...input,
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('schools', updated);
  return updated;
}

export async function deleteSchool(id: string): Promise<boolean> {
  try {
    await deleteFromStore('schools', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Player Operations
// ============================================================================

export async function createPlayer(input: CreatePlayerInput): Promise<PlayerFull> {
  const record_id = generateId();
  const now = getCurrentTimestamp();

  const player: PlayerFull = {
    record_id,
    first_name: input.person.first_name,
    last_name: input.person.last_name,
    email: input.person.email,
    phone: input.person.phone,
    twitter_url: input.person.twitter_url,
    linkedin_url: input.person.linkedin_url,
    instagram_url: input.person.instagram_url,
    facebook_url: input.person.facebook_url,
    tiktok_url: input.person.tiktok_url,
    type: 'player',
    school_id: input.person.school_id,
    assigned_coach_id: input.person.assigned_coach_id,
    created_at: now,
    updated_at: now,
    player: {
      person_id: record_id,
      position: input.player.position || [],
      grad_year: input.player.grad_year,
      years_eligibility: input.player.years_eligibility,
      priority: input.player.priority,
      likelihood: input.player.likelihood,
    },
    rating: input.rating ? {
      record_id: generateId(),
      player_id: record_id,
      maxpreps: input.rating.maxpreps,
      rating_247: input.rating.rating_247,
      composite_247: input.rating.composite_247,
      internal_rating: input.rating.internal_rating,
      created_at: now,
      updated_at: now,
    } : undefined,
    nil_agreement: input.nil_agreement ? {
      record_id: generateId(),
      player_id: record_id,
      committed_nil: input.nil_agreement.committed_nil,
      estimated_nil: input.nil_agreement.estimated_nil,
      created_at: now,
      updated_at: now,
    } : undefined,
    tasks: [],
  };

  // Add school and assigned coach references
  if (player.school_id) {
    player.school = await getSchoolById(player.school_id);
  }
  if (player.assigned_coach_id) {
    player.assigned_coach = await getCoachById(player.assigned_coach_id);
  }

  await putInStore('people', player);
  return player;
}

export async function getPlayerById(id: string): Promise<PlayerFull | undefined> {
  const person = await getFromStore<PersonFull>('people', id);
  if (!person || person.type !== 'player') return undefined;

  const player = person as PlayerFull;

  // Populate relationships
  if (player.school_id) {
    player.school = await getSchoolById(player.school_id);
  }
  if (player.assigned_coach_id) {
    player.assigned_coach = await getCoachById(player.assigned_coach_id);
  }
  player.tasks = await getTasksByPersonId(id);

  // Populate new NIL arrays
  player.external_nil_deals = await getExternalNILDealsByPlayerId(id);
  player.institutional_allocations = await getInstitutionalAllocationsByPlayerId(id);

  return player;
}

export async function getAllPlayers(): Promise<PlayerFull[]> {
  const people = await getAllFromStore<PersonFull>('people');
  const players = people.filter((p) => p.type === 'player') as PlayerFull[];

  // Populate relationships for each player
  for (const player of players) {
    if (player.school_id) {
      player.school = await getSchoolById(player.school_id);
    }
    if (player.assigned_coach_id) {
      player.assigned_coach = await getCoachById(player.assigned_coach_id);
    }
    player.tasks = await getTasksByPersonId(player.record_id);

    // Populate new NIL arrays
    player.external_nil_deals = await getExternalNILDealsByPlayerId(player.record_id);
    player.institutional_allocations = await getInstitutionalAllocationsByPlayerId(player.record_id);
  }

  return players.sort((a, b) => {
    const aName = `${a.last_name} ${a.first_name}`;
    const bName = `${b.last_name} ${b.first_name}`;
    return aName.localeCompare(bName);
  });
}

export async function updatePlayer(id: string, input: Partial<CreatePlayerInput>): Promise<PlayerFull | undefined> {
  const existing = await getPlayerById(id);
  if (!existing) return undefined;

  const updated: PlayerFull = {
    ...existing,
    ...(input.person && {
      first_name: input.person.first_name ?? existing.first_name,
      last_name: input.person.last_name ?? existing.last_name,
      email: input.person.email ?? existing.email,
      phone: input.person.phone ?? existing.phone,
      twitter_url: input.person.twitter_url ?? existing.twitter_url,
      linkedin_url: input.person.linkedin_url ?? existing.linkedin_url,
      instagram_url: input.person.instagram_url ?? existing.instagram_url,
      facebook_url: input.person.facebook_url ?? existing.facebook_url,
      tiktok_url: input.person.tiktok_url ?? existing.tiktok_url,
      school_id: input.person.school_id ?? existing.school_id,
      assigned_coach_id: input.person.assigned_coach_id ?? existing.assigned_coach_id,
    }),
    player: {
      ...existing.player,
      ...(input.player && {
        position: input.player.position ?? existing.player.position,
        grad_year: input.player.grad_year ?? existing.player.grad_year,
        years_eligibility: input.player.years_eligibility ?? existing.player.years_eligibility,
        priority: input.player.priority ?? existing.player.priority,
        likelihood: input.player.likelihood ?? existing.player.likelihood,
      }),
    },
    rating: input.rating ? {
      record_id: existing.rating?.record_id || generateId(),
      player_id: id,
      maxpreps: input.rating.maxpreps,
      rating_247: input.rating.rating_247,
      composite_247: input.rating.composite_247,
      internal_rating: input.rating.internal_rating,
      created_at: existing.rating?.created_at || getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    } : existing.rating,
    nil_agreement: input.nil_agreement ? {
      record_id: existing.nil_agreement?.record_id || generateId(),
      player_id: id,
      committed_nil: input.nil_agreement.committed_nil,
      estimated_nil: input.nil_agreement.estimated_nil,
      created_at: existing.nil_agreement?.created_at || getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    } : existing.nil_agreement,
    updated_at: getCurrentTimestamp(),
  };

  // Update relationships
  if (updated.school_id) {
    updated.school = await getSchoolById(updated.school_id);
  }
  if (updated.assigned_coach_id) {
    updated.assigned_coach = await getCoachById(updated.assigned_coach_id);
  }

  await putInStore('people', updated);
  return updated;
}

export async function deletePlayer(id: string): Promise<boolean> {
  try {
    // Delete associated tasks
    const tasks = await getTasksByPersonId(id);
    for (const task of tasks) {
      await deleteTask(task.record_id);
    }

    // Delete associated NIL records
    const externalDeals = await getExternalNILDealsByPlayerId(id);
    for (const deal of externalDeals) {
      await deleteExternalNILDeal(deal.record_id);
    }

    const allocations = await getInstitutionalAllocationsByPlayerId(id);
    for (const allocation of allocations) {
      await deleteInstitutionalAllocation(allocation.record_id);
    }

    await deleteFromStore('people', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Coach Operations
// ============================================================================

export async function createCoach(input: CreateCoachInput): Promise<CoachFull> {
  const record_id = generateId();
  const now = getCurrentTimestamp();

  const coach: CoachFull = {
    record_id,
    first_name: input.person.first_name,
    last_name: input.person.last_name,
    email: input.person.email,
    phone: input.person.phone,
    twitter_url: input.person.twitter_url,
    linkedin_url: input.person.linkedin_url,
    instagram_url: input.person.instagram_url,
    facebook_url: input.person.facebook_url,
    tiktok_url: input.person.tiktok_url,
    type: 'coach',
    school_id: input.person.school_id,
    assigned_coach_id: input.person.assigned_coach_id,
    created_at: now,
    updated_at: now,
    coach: {
      person_id: record_id,
      specialty: input.coach.specialty || [],
      committed_salary: input.coach.committed_salary,
      estimated_salary: input.coach.estimated_salary,
    },
    tasks: [],
  };

  if (coach.school_id) {
    coach.school = await getSchoolById(coach.school_id);
  }

  await putInStore('people', coach);
  return coach;
}

export async function getCoachById(id: string): Promise<CoachFull | undefined> {
  const person = await getFromStore<PersonFull>('people', id);
  if (!person || person.type !== 'coach') return undefined;

  const coach = person as CoachFull;

  if (coach.school_id) {
    coach.school = await getSchoolById(coach.school_id);
  }
  coach.tasks = await getTasksByPersonId(id);

  return coach;
}

export async function getAllCoaches(): Promise<CoachFull[]> {
  const people = await getAllFromStore<PersonFull>('people');
  const coaches = people.filter((p) => p.type === 'coach') as CoachFull[];

  for (const coach of coaches) {
    if (coach.school_id) {
      coach.school = await getSchoolById(coach.school_id);
    }
    coach.tasks = await getTasksByPersonId(coach.record_id);
  }

  return coaches.sort((a, b) => {
    const aName = `${a.last_name} ${a.first_name}`;
    const bName = `${b.last_name} ${b.first_name}`;
    return aName.localeCompare(bName);
  });
}

export async function updateCoach(id: string, input: Partial<CreateCoachInput>): Promise<CoachFull | undefined> {
  const existing = await getCoachById(id);
  if (!existing) return undefined;

  const updated: CoachFull = {
    ...existing,
    ...(input.person && {
      first_name: input.person.first_name ?? existing.first_name,
      last_name: input.person.last_name ?? existing.last_name,
      email: input.person.email ?? existing.email,
      phone: input.person.phone ?? existing.phone,
      twitter_url: input.person.twitter_url ?? existing.twitter_url,
      linkedin_url: input.person.linkedin_url ?? existing.linkedin_url,
      instagram_url: input.person.instagram_url ?? existing.instagram_url,
      facebook_url: input.person.facebook_url ?? existing.facebook_url,
      tiktok_url: input.person.tiktok_url ?? existing.tiktok_url,
      school_id: input.person.school_id ?? existing.school_id,
      assigned_coach_id: input.person.assigned_coach_id ?? existing.assigned_coach_id,
    }),
    coach: {
      ...existing.coach,
      ...(input.coach && {
        specialty: input.coach.specialty ?? existing.coach.specialty,
        committed_salary: input.coach.committed_salary ?? existing.coach.committed_salary,
        estimated_salary: input.coach.estimated_salary ?? existing.coach.estimated_salary,
      }),
    },
    updated_at: getCurrentTimestamp(),
  };

  // Update relationships
  if (updated.school_id) {
    updated.school = await getSchoolById(updated.school_id);
  }

  await putInStore('people', updated);
  return updated;
}

export async function deleteCoach(id: string): Promise<boolean> {
  try {
    const tasks = await getTasksByPersonId(id);
    for (const task of tasks) {
      await deleteTask(task.record_id);
    }

    await deleteFromStore('people', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Staff Operations
// ============================================================================

export async function createStaff(input: CreateStaffInput): Promise<StaffFull> {
  const record_id = generateId();
  const now = getCurrentTimestamp();

  const staff: StaffFull = {
    record_id,
    first_name: input.person.first_name,
    last_name: input.person.last_name,
    email: input.person.email,
    phone: input.person.phone,
    twitter_url: input.person.twitter_url,
    linkedin_url: input.person.linkedin_url,
    instagram_url: input.person.instagram_url,
    facebook_url: input.person.facebook_url,
    tiktok_url: input.person.tiktok_url,
    type: 'staff',
    school_id: input.person.school_id,
    assigned_coach_id: input.person.assigned_coach_id,
    created_at: now,
    updated_at: now,
    staff: {
      person_id: record_id,
      specialty: input.staff.specialty || [],
    },
    tasks: [],
  };

  if (staff.school_id) {
    staff.school = await getSchoolById(staff.school_id);
  }

  await putInStore('people', staff);
  return staff;
}

export async function getStaffById(id: string): Promise<StaffFull | undefined> {
  const person = await getFromStore<PersonFull>('people', id);
  if (!person || person.type !== 'staff') return undefined;

  const staff = person as StaffFull;

  if (staff.school_id) {
    staff.school = await getSchoolById(staff.school_id);
  }
  staff.tasks = await getTasksByPersonId(id);

  return staff;
}

export async function getAllStaff(): Promise<StaffFull[]> {
  const people = await getAllFromStore<PersonFull>('people');
  const staff = people.filter((p) => p.type === 'staff') as StaffFull[];

  for (const s of staff) {
    if (s.school_id) {
      s.school = await getSchoolById(s.school_id);
    }
    s.tasks = await getTasksByPersonId(s.record_id);
  }

  return staff.sort((a, b) => {
    const aName = `${a.last_name} ${a.first_name}`;
    const bName = `${b.last_name} ${b.first_name}`;
    return aName.localeCompare(bName);
  });
}

export async function updateStaff(id: string, input: Partial<CreateStaffInput>): Promise<StaffFull | undefined> {
  const existing = await getStaffById(id);
  if (!existing) return undefined;

  const updated: StaffFull = {
    ...existing,
    ...(input.person && {
      first_name: input.person.first_name ?? existing.first_name,
      last_name: input.person.last_name ?? existing.last_name,
      email: input.person.email ?? existing.email,
      phone: input.person.phone ?? existing.phone,
      twitter_url: input.person.twitter_url ?? existing.twitter_url,
      linkedin_url: input.person.linkedin_url ?? existing.linkedin_url,
      instagram_url: input.person.instagram_url ?? existing.instagram_url,
      facebook_url: input.person.facebook_url ?? existing.facebook_url,
      tiktok_url: input.person.tiktok_url ?? existing.tiktok_url,
      school_id: input.person.school_id ?? existing.school_id,
      assigned_coach_id: input.person.assigned_coach_id ?? existing.assigned_coach_id,
    }),
    staff: {
      ...existing.staff,
      ...(input.staff && {
        specialty: input.staff.specialty ?? existing.staff.specialty,
      }),
    },
    updated_at: getCurrentTimestamp(),
  };

  // Update relationships
  if (updated.school_id) {
    updated.school = await getSchoolById(updated.school_id);
  }

  await putInStore('people', updated);
  return updated;
}

export async function deleteStaff(id: string): Promise<boolean> {
  try {
    const tasks = await getTasksByPersonId(id);
    for (const task of tasks) {
      await deleteTask(task.record_id);
    }

    await deleteFromStore('people', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Generic Person Operations
// ============================================================================

export async function getAllPeople(): Promise<PersonFull[]> {
  const people = await getAllFromStore<PersonFull>('people');

  // Populate relationships
  for (const person of people) {
    if (person.school_id) {
      person.school = await getSchoolById(person.school_id);
    }
    if (person.type === 'player' && person.assigned_coach_id) {
      person.assigned_coach = await getCoachById(person.assigned_coach_id);
    }
    person.tasks = await getTasksByPersonId(person.record_id);
  }

  return people.sort((a, b) => {
    const aName = `${a.last_name} ${a.first_name}`;
    const bName = `${b.last_name} ${b.first_name}`;
    return aName.localeCompare(bName);
  });
}

export async function getPersonById(id: string): Promise<PersonFull | undefined> {
  const person = await getFromStore<PersonFull>('people', id);
  if (!person) return undefined;

  switch (person.type) {
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

export async function deletePerson(id: string): Promise<boolean> {
  try {
    const tasks = await getTasksByPersonId(id);
    for (const task of tasks) {
      await deleteTask(task.record_id);
    }

    await deleteFromStore('people', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Task Operations
// ============================================================================

export async function createTask(input: TaskInput): Promise<Task> {
  const task: Task = {
    record_id: generateId(),
    person_id: input.person_id,
    status: input.status,
    due_date: input.due_date,
    description: input.description,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('tasks', task);
  return task;
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return getFromStore<Task>('tasks', id);
}

export async function getTasksByPersonId(person_id: string): Promise<Task[]> {
  const allTasks = await getAllFromStore<Task>('tasks');
  return allTasks
    .filter((task) => task.person_id === person_id)
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return a.created_at.localeCompare(b.created_at);
    });
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task | undefined> {
  const existing = await getTaskById(id);
  if (!existing) return undefined;

  const updated: Task = {
    ...existing,
    ...input,
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('tasks', updated);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    await deleteFromStore('tasks', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// External NIL Deal Operations
// ============================================================================

export async function createExternalNILDeal(input: ExternalNILDealInput): Promise<ExternalNILDeal> {
  const deal: ExternalNILDeal = {
    record_id: generateId(),
    player_id: input.player_id,
    source_type: input.source_type,
    committed_amount: input.committed_amount,
    estimated_amount: input.estimated_amount,
    deliverables_required: input.deliverables_required,
    start_date: input.start_date,
    end_date: input.end_date,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('external_nil_deals', deal);
  return deal;
}

export async function getExternalNILDealsByPlayerId(player_id: string): Promise<ExternalNILDeal[]> {
  return getByIndex<ExternalNILDeal>('external_nil_deals', 'player_id', player_id);
}

export async function getExternalNILDealById(id: string): Promise<ExternalNILDeal | undefined> {
  return getFromStore<ExternalNILDeal>('external_nil_deals', id);
}

export async function updateExternalNILDeal(id: string, input: Partial<ExternalNILDealInput>): Promise<ExternalNILDeal | undefined> {
  const existing = await getExternalNILDealById(id);
  if (!existing) return undefined;

  const updated: ExternalNILDeal = {
    ...existing,
    ...input,
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('external_nil_deals', updated);
  return updated;
}

export async function deleteExternalNILDeal(id: string): Promise<boolean> {
  try {
    await deleteFromStore('external_nil_deals', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Institutional Allocation Operations
// ============================================================================

export async function createInstitutionalAllocation(input: InstitutionalAllocationInput): Promise<InstitutionalAllocation> {
  const allocation: InstitutionalAllocation = {
    record_id: generateId(),
    player_id: input.player_id,
    allocation_type: input.allocation_type,
    annual_amount: input.annual_amount,
    recruiting_cycle_id: input.recruiting_cycle_id,
    team_id: input.team_id,
    counts_toward_cap: input.counts_toward_cap,
    funding_pool_id: input.funding_pool_id,
    status: input.status,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('institutional_allocations', allocation);
  return allocation;
}

export async function getInstitutionalAllocationsByPlayerId(player_id: string): Promise<InstitutionalAllocation[]> {
  return getByIndex<InstitutionalAllocation>('institutional_allocations', 'player_id', player_id);
}

export async function getInstitutionalAllocationById(id: string): Promise<InstitutionalAllocation | undefined> {
  return getFromStore<InstitutionalAllocation>('institutional_allocations', id);
}

export async function updateInstitutionalAllocation(id: string, input: Partial<InstitutionalAllocationInput>): Promise<InstitutionalAllocation | undefined> {
  const existing = await getInstitutionalAllocationById(id);
  if (!existing) return undefined;

  const updated: InstitutionalAllocation = {
    ...existing,
    ...input,
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('institutional_allocations', updated);
  return updated;
}

export async function deleteInstitutionalAllocation(id: string): Promise<boolean> {
  try {
    await deleteFromStore('institutional_allocations', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Funding Pool Operations
// ============================================================================

export async function createFundingPool(input: FundingPoolInput): Promise<FundingPool> {
  const pool: FundingPool = {
    record_id: generateId(),
    team_id: input.team_id,
    recruiting_cycle_id: input.recruiting_cycle_id,
    pool_type: input.pool_type,
    total_amount: input.total_amount,
    allocated_amount: input.allocated_amount,
    cap_type: input.cap_type,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('funding_pools', pool);
  return pool;
}

export async function getAllFundingPools(): Promise<FundingPool[]> {
  return getAllFromStore<FundingPool>('funding_pools');
}

export async function getFundingPoolById(id: string): Promise<FundingPool | undefined> {
  return getFromStore<FundingPool>('funding_pools', id);
}

export async function updateFundingPool(id: string, input: Partial<FundingPoolInput>): Promise<FundingPool | undefined> {
  const existing = await getFundingPoolById(id);
  if (!existing) return undefined;

  const updated: FundingPool = {
    ...existing,
    ...input,
    updated_at: getCurrentTimestamp(),
  };

  await putInStore('funding_pools', updated);
  return updated;
}

export async function deleteFundingPool(id: string): Promise<boolean> {
  try {
    await deleteFromStore('funding_pools', id);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Player Rating Operations
// ============================================================================

export async function updatePlayerRating(player_id: string, input: Partial<Omit<PlayerRatingInput, 'player_id'>>): Promise<void> {
  const player = await getPlayerById(player_id);
  if (!player) return;

  const existingRating = player.rating;

  if (existingRating) {
    // Update existing rating
    const updatedRating = {
      ...existingRating,
      maxpreps: input.maxpreps ?? existingRating.maxpreps,
      rating_247: input.rating_247 ?? existingRating.rating_247,
      composite_247: input.composite_247 ?? existingRating.composite_247,
      internal_rating: input.internal_rating ?? existingRating.internal_rating,
      updated_at: getCurrentTimestamp(),
    };

    // Update the player record with the new rating
    player.rating = updatedRating;
    await putInStore('people', player);
  } else {
    // Create new rating
    const newRating = {
      record_id: generateId(),
      player_id: player_id,
      maxpreps: input.maxpreps,
      rating_247: input.rating_247,
      composite_247: input.composite_247,
      internal_rating: input.internal_rating,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };

    player.rating = newRating;
    await putInStore('people', player);
  }
}
