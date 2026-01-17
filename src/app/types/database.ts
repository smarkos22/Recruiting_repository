// ============================================================================
// Core Data Model Types for Athletic Recruiting & NIL Management Platform
// ============================================================================

// Enums and Constants
export const PersonType = {
  PLAYER: 'player',
  COACH: 'coach',
  STAFF: 'staff',
} as const;

export type PersonTypeValue = typeof PersonType[keyof typeof PersonType];

export const Position = {
  QB: 'QB',
  RB: 'RB',
  FB: 'FB',
  C: 'C',
  G: 'G',
  T: 'T',
  TE: 'TE',
  WR: 'WR',
  N: 'N',
  DT: 'DT',
  DE: 'DE',
  OLB: 'OLB',
  MLB: 'MLB',
  S: 'S',
  SS: 'SS',
  CB: 'CB',
  ATH: 'ATH',
} as const;

export type PositionValue = typeof Position[keyof typeof Position];

export const CoachSpecialty = {
  OFFENSE: 'Offense',
  DEFENSE: 'Defense',
  SPECIAL_TEAMS: 'Special Teams',
  QBS: "QB's",
  RBS: "RB's",
  O_LINE: 'O-Line',
  D_LINE: 'D-Line',
  LINEBACKERS: 'Linebackers',
  SECONDARY: 'Secondary',
} as const;

export type CoachSpecialtyValue = typeof CoachSpecialty[keyof typeof CoachSpecialty];

export const StaffSpecialty = {
  FINANCE: 'Finance',
  RECRUITING: 'Recruiting',
  ADMIN: 'Admin',
  OPERATIONS: 'Operations',
} as const;

export type StaffSpecialtyValue = typeof StaffSpecialty[keyof typeof StaffSpecialty];

export const SchoolType = {
  HIGH_SCHOOL: 'High School',
  DIVISION_I: 'Division I',
  DIVISION_II: 'Division II',
  DIVISION_III: 'Division III',
  NAIA: 'NAIA',
  JUCO: 'JUCO',
} as const;

export type SchoolTypeValue = typeof SchoolType[keyof typeof SchoolType];

export const TaskStatus = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
} as const;

export type TaskStatusValue = typeof TaskStatus[keyof typeof TaskStatus];

export const USStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export type USState = typeof USStates[number];

// ============================================================================
// Base Tables
// ============================================================================

/**
 * Base Person record - all people (players, coaches, staff) share these fields
 */
export interface PersonBase {
  record_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  type: PersonTypeValue;
  school_id?: string;
  assigned_coach_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Player-specific fields (extends PersonBase)
 */
export interface Player {
  person_id: string;
  position: PositionValue[];
  grad_year?: number;
  years_eligibility?: number;
  priority?: number; // 1-5
  likelihood?: number; // 1-5
}

/**
 * Coach-specific fields (extends PersonBase)
 */
export interface Coach {
  person_id: string;
  specialty: CoachSpecialtyValue[];
  committed_salary?: number;
  estimated_salary?: number;
}

/**
 * Staff-specific fields (extends PersonBase)
 */
export interface Staff {
  person_id: string;
  specialty: StaffSpecialtyValue[];
}

/**
 * School record
 */
export interface School {
  record_id: string;
  name: string;
  city?: string;
  state?: USState;
  type: SchoolTypeValue[];
  created_at: string;
  updated_at: string;
}

/**
 * Player Ratings - external and internal ratings
 */
export interface PlayerRating {
  record_id: string;
  player_id: string;
  maxpreps?: number; // 1-5
  rating_247?: number; // 1-5
  composite_247?: number; // float
  internal_rating?: number; // 1-5, user-editable
  created_at: string;
  updated_at: string;
}

/**
 * NIL Agreement record
 * @deprecated Use ExternalNILDeal and InstitutionalAllocation instead
 * This is kept for migration purposes only
 */
export interface NILAgreement {
  record_id: string;
  player_id: string;
  committed_nil?: number;
  estimated_nil?: number;
  created_at: string;
  updated_at: string;
}

/**
 * External NIL Deal - Brand income, marketplace deals, collective payments
 * This tracks athlete's third-party NIL income (NOT school revenue sharing)
 */
export interface ExternalNILDeal {
  record_id: string;
  player_id: string;
  source_type: 'brand' | 'marketplace' | 'collective';
  committed_amount?: number;
  estimated_amount?: number;
  deliverables_required?: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Institutional Allocation - School revenue sharing payments
 * This tracks the school's direct payments to athletes (roster economics)
 */
export interface InstitutionalAllocation {
  record_id: string;
  player_id: string;
  allocation_type: 'baseline' | 'recruiting' | 'retention' | 'performance';
  annual_amount?: number;
  recruiting_cycle_id?: string; // Simple string like "2025"
  team_id?: string; // Simple string like "Football"
  counts_toward_cap: boolean;
  funding_pool_id?: string;
  status: 'proposed' | 'approved' | 'active';
  created_at: string;
  updated_at: string;
}

/**
 * Funding Pool - Budget tracking for ADs/GMs
 * Tracks total budget, allocated amounts, and cap management
 */
export interface FundingPool {
  record_id: string;
  team_id: string; // Simple string like "Football"
  recruiting_cycle_id?: string; // Simple string like "2025"
  pool_type: 'revenue_share' | 'retention_pool';
  total_amount: number;
  allocated_amount: number;
  cap_type: 'hard' | 'soft';
  created_at: string;
  updated_at: string;
}

/**
 * Task record - activities for recruiting
 */
export interface Task {
  record_id: string;
  person_id: string;
  status: TaskStatusValue;
  due_date?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Composite/View Types (for UI consumption)
// ============================================================================

/**
 * Full Player record with all joined data
 */
export interface PlayerFull extends PersonBase {
  type: 'player';
  player: Player;
  rating?: PlayerRating;
  /** @deprecated Use external_nil_deals and institutional_allocations instead */
  nil_agreement?: NILAgreement;
  external_nil_deals?: ExternalNILDeal[];
  institutional_allocations?: InstitutionalAllocation[];
  school?: School;
  assigned_coach?: CoachFull;
  tasks?: Task[];
}

/**
 * Full Coach record with all joined data
 */
export interface CoachFull extends PersonBase {
  type: 'coach';
  coach: Coach;
  school?: School;
  tasks?: Task[];
}

/**
 * Full Staff record with all joined data
 */
export interface StaffFull extends PersonBase {
  type: 'staff';
  staff: Staff;
  school?: School;
  tasks?: Task[];
}

/**
 * Union type for any person
 */
export type PersonFull = PlayerFull | CoachFull | StaffFull;

/**
 * School with associated people counts
 */
export interface SchoolWithCounts extends School {
  player_count: number;
  coach_count: number;
  staff_count: number;
}

// ============================================================================
// Input Types (for creating/updating records)
// ============================================================================

export type PersonBaseInput = Omit<PersonBase, 'record_id' | 'created_at' | 'updated_at'>;
export type PlayerInput = Omit<Player, 'person_id'>;
export type CoachInput = Omit<Coach, 'person_id'>;
export type StaffInput = Omit<Staff, 'person_id'>;
export type SchoolInput = Omit<School, 'record_id' | 'created_at' | 'updated_at'>;
export type PlayerRatingInput = Omit<PlayerRating, 'record_id' | 'created_at' | 'updated_at'>;
/** @deprecated */
export type NILAgreementInput = Omit<NILAgreement, 'record_id' | 'created_at' | 'updated_at'>;
export type ExternalNILDealInput = Omit<ExternalNILDeal, 'record_id' | 'created_at' | 'updated_at'>;
export type InstitutionalAllocationInput = Omit<InstitutionalAllocation, 'record_id' | 'created_at' | 'updated_at'>;
export type FundingPoolInput = Omit<FundingPool, 'record_id' | 'created_at' | 'updated_at'>;
export type TaskInput = Omit<Task, 'record_id' | 'created_at' | 'updated_at'>;

/**
 * Combined input for creating a new player
 */
export interface CreatePlayerInput {
  person: PersonBaseInput;
  player: PlayerInput;
  rating?: Omit<PlayerRatingInput, 'player_id'>;
  /** @deprecated */
  nil_agreement?: Omit<NILAgreementInput, 'player_id'>;
  external_nil_deals?: Omit<ExternalNILDealInput, 'player_id'>[];
  institutional_allocations?: Omit<InstitutionalAllocationInput, 'player_id'>[];
}

/**
 * Combined input for creating a new coach
 */
export interface CreateCoachInput {
  person: PersonBaseInput;
  coach: CoachInput;
}

/**
 * Combined input for creating a new staff
 */
export interface CreateStaffInput {
  person: PersonBaseInput;
  staff: StaffInput;
}

export type CreatePersonInput = CreatePlayerInput | CreateCoachInput | CreateStaffInput;
