import { PersonTypeValue, PositionValue, School } from "../types/database";

interface RecruitFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRole: PersonTypeValue | "all";
  onRoleChange: (role: PersonTypeValue | "all") => void;
  selectedPosition: PositionValue | "all";
  onPositionChange: (position: PositionValue | "all") => void;
  availablePositions: PositionValue[];
  selectedState: string;
  onStateChange: (state: string) => void;
  availableStates: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  availableCities: string[];
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  selectedSchool: string | "all";
  onSchoolChange: (schoolId: string | "all") => void;
  availableSchools: School[];
}

export function RecruitFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedPosition,
  onPositionChange,
  availablePositions,
  selectedState,
  onStateChange,
  availableStates,
  selectedCity,
  onCityChange,
  availableCities,
  selectedRating,
  onRatingChange,
  selectedSchool,
  onSchoolChange,
  availableSchools,
}: RecruitFiltersProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white/70 p-5 space-y-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)]">Refine ledger</p>
        <h3 className="font-serif text-lg text-[var(--ink)]">Filters</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">Search</label>
          <input
            type="text"
            placeholder="Name, school, or notes"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value as PersonTypeValue | "all")}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">All Roles</option>
            <option value="coach">Coach</option>
            <option value="player">Player</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">Position</label>
          <select
            value={selectedPosition}
            onChange={(e) => onPositionChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">All Positions</option>
            {availablePositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">MaxPreps rating</label>
          <select
            value={selectedRating}
            onChange={(e) => onRatingChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">School</label>
          <select
            value={selectedSchool}
            onChange={(e) => onSchoolChange(e.target.value === "all" ? "all" : e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">All Schools</option>
            {availableSchools.map((school) => (
              <option key={school.record_id} value={school.record_id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">State</label>
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">All States</option>
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-[var(--ink-muted)]">City</label>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="all">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
