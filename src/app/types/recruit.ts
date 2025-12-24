export interface SocialMedia {
  twitter?: string;
  instagram?: string;
  hudl?: string;
  maxpreps?: string;
}

export interface Ratings {
  maxpreps?: number; // 1-5 star rating from MaxPreps
  stars247?: number;
  starsRivals?: number;
  starsESPN?: number;
  starsOn3?: number;
  composite?: number;
  maxprepsRating?: number;
}

export type ProspectType = "high-school" | "transfer";
export type RecruitStatus = "contacted" | "offered" | "visited" | "committed" | "signed" | "not-interested";
export type PersonRole = "coach" | "player" | "staff";
export type SchoolType = "high-school" | "college";

export interface School {
  id: string;
  name: string;
  city?: string;
  state?: string;
  type: SchoolType;
}

export interface Person {
  id: string;
  name: string;
  role: PersonRole;
  currentSchool?: string;
  schoolId?: string;
  city?: string;
  state?: string;
  position?: string;
  graduationYear?: number;
  heightFeet?: number;
  heightInches?: number;
  weight?: string;
  email?: string;
  phone?: string;
  notes?: string;
  socialMedia?: SocialMedia;
  ratings?: Ratings;
  prospectType?: ProspectType;
  status?: RecruitStatus;
  dateAdded: string;
}
