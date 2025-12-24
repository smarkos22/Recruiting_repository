import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Building2, Bell, CheckSquare, FileText, Mail, Phone, Workflow } from "lucide-react";
import { Person, ProspectType, RecruitStatus, School, PersonRole } from "./types/recruit";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { RecruitFilters } from "./components/RecruitFilters";
import { RecruitTable } from "./components/RecruitTable";
import { RecruitDialog } from "./components/RecruitDialog";
import { Button } from "./components/ui/Button";
import { PersonDetail } from "./components/PersonDetail";
import logo from "../assets/columbia-logo.jpg";

const STORAGE_KEY = "recruittrack_people";
const SCHOOLS_KEY = "recruittrack_schools";

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [currentView, setCurrentView] = useState<"dashboard" | "people" | "schools">("dashboard");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<PersonRole | "all">("all");
  const [selectedProspectType, setSelectedProspectType] = useState<ProspectType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<RecruitStatus | "all">("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState<string | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedSchools = localStorage.getItem(SCHOOLS_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPeople(data);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    if (storedSchools) {
      try {
        setSchools(JSON.parse(storedSchools));
      } catch (e) {
        console.error("Failed to load schools", e);
      }
    }

    if (!stored && !storedSchools) {
      const sampleSchools: School[] = [
        { id: "s1", name: "Lincoln High School", city: "Los Angeles", state: "CA", type: "high-school" },
        { id: "s2", name: "Central High", city: "Miami", state: "FL", type: "high-school" },
        { id: "s3", name: "State University", city: "Austin", state: "TX", type: "college" },
      ];

      const sampleData: Person[] = [
        {
          id: "1",
          name: "Marcus Johnson",
          role: "player",
          socialMedia: {
            twitter: "https://twitter.com/marcusj",
            hudl: "https://hudl.com/marcusj",
          },
          prospectType: "high-school",
          currentSchool: "Lincoln High School",
          schoolId: "s1",
          city: "Los Angeles",
          state: "CA",
          ratings: {
            maxpreps: 4,
            maxprepsRating: 4,
            composite: 92.1,
          },
          position: "QB",
          graduationYear: 2025,
          heightFeet: 6,
          heightInches: 3,
          weight: "205 lbs",
          status: "offered",
          dateAdded: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Tyler Davis",
          role: "player",
          socialMedia: {
            instagram: "https://instagram.com/tdavis",
            twitter: "https://twitter.com/tdavis",
          },
          prospectType: "transfer",
          currentSchool: "State University",
          schoolId: "s3",
          city: "Austin",
          state: "TX",
          ratings: {
            maxpreps: 3,
            stars247: 3,
            composite: 87.4,
          },
          position: "WR",
          graduationYear: 2024,
          heightFeet: 6,
          heightInches: 1,
          weight: "190 lbs",
          status: "contacted",
          dateAdded: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Derek Williams",
          role: "player",
          socialMedia: {
            hudl: "https://hudl.com/dwilliams",
          },
          prospectType: "high-school",
          currentSchool: "Central High",
          schoolId: "s2",
          city: "Miami",
          state: "FL",
          ratings: {
            maxpreps: 5,
            starsESPN: 5,
            composite: 96.5,
          },
          position: "RB",
          graduationYear: 2025,
          heightFeet: 5,
          heightInches: 11,
          weight: "210 lbs",
          status: "committed",
          dateAdded: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Leah Chen",
          role: "player",
          socialMedia: {
            instagram: "https://instagram.com/leahchen",
          },
          prospectType: "transfer",
          currentSchool: "State University",
          schoolId: "s3",
          city: "Austin",
          state: "TX",
          ratings: {
            maxpreps: 4,
            starsRivals: 4,
            composite: 90.2,
          },
          position: "CB",
          graduationYear: 2024,
          heightFeet: 5,
          heightInches: 10,
          weight: "178 lbs",
          status: "visited",
          dateAdded: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Coach Alvarez",
          role: "coach",
          socialMedia: {},
          currentSchool: "Central High",
          schoolId: "s2",
          city: "Miami",
          state: "FL",
          position: "Head Coach",
          dateAdded: new Date().toISOString(),
          ratings: {},
        },
        {
          id: "6",
          name: "Jordan Price",
          role: "player",
          socialMedia: {
            twitter: "https://twitter.com/jprice",
          },
          currentSchool: "State University",
          schoolId: "s3",
          city: "Austin",
          state: "TX",
          position: "WR",
          graduationYear: 2026,
          dateAdded: new Date().toISOString(),
          ratings: {
            starsOn3: 4,
            composite: 88.3,
          },
        },
      ];
      setSchools(sampleSchools);
      setPeople(sampleData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify(sampleSchools));
    }
  }, []);

  useEffect(() => {
    if (schools.length === 0 && people.length > 0) {
      const derived: School[] = Array.from(
        new Map(
          people
            .filter((r) => r.currentSchool)
            .map((r) => [r.currentSchool, { id: r.currentSchool, name: r.currentSchool, type: "high-school" as const }])
        ).values()
      );
      setSchools(derived);
    }
  }, [people, schools.length]);

  // Save to localStorage whenever people change
  useEffect(() => {
    if (people.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    }
  }, [people]);

  useEffect(() => {
    if (schools.length > 0) {
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
    }
  }, [schools]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 6500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const exitTimer = setTimeout(() => setShowSplash(false), 700);
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (currentView !== "people") {
      setSelectedPersonId(null);
    }
  }, [currentView]);

  const handleAddRecruit = () => {
    setDialogMode("add");
    setEditingPerson(undefined);
    setIsDialogOpen(true);
  };

  const handleEditRecruit = (recruit: Person) => {
    setDialogMode("edit");
    setEditingPerson(recruit);
    setIsDialogOpen(true);
  };

  const handleSaveRecruit = (recruitData: Omit<Person, "id" | "dateAdded"> & { id?: string }) => {
    const schoolName = recruitData.schoolId
      ? schools.find((s) => s.id === recruitData.schoolId)?.name
      : undefined;

    if (dialogMode === "add") {
      const newPerson: Person = {
        ...recruitData,
        currentSchool: schoolName || recruitData.currentSchool,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString(),
      } as Person;
      setPeople([...people, newPerson]);
    } else if (dialogMode === "edit" && recruitData.id) {
      setPeople(
        people.map((r) =>
          r.id === recruitData.id
            ? { ...recruitData, currentSchool: schoolName || recruitData.currentSchool, dateAdded: r.dateAdded } as Person
            : r
        )
      );
    }
  };

  const handleDeleteRecruit = (id: string) => {
    if (confirm("Are you sure you want to delete this recruit?")) {
      setPeople(people.filter((r) => r.id !== id));
    }
  };

  // Filter people
  const filteredPeople = people.filter((recruit) => {
    const searchName = recruit.name || "";
    const searchSchool = recruit.currentSchool || "";
    const matchesSearch =
      searchQuery === "" ||
      searchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchSchool.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || recruit.role === selectedRole;

    const matchesProspectType =
      selectedProspectType === "all" || recruit.prospectType === selectedProspectType;

    const matchesStatus = selectedStatus === "all" || recruit.status === selectedStatus;

    const matchesPosition = selectedPosition === "all" || recruit.position === selectedPosition;

    const matchesState = selectedState === "all" || recruit.state === selectedState;

    const matchesCity = selectedCity === "all" || recruit.city === selectedCity;

    const matchesRating = selectedRating === "all" || recruit.ratings?.maxpreps === parseInt(selectedRating);

    const matchesSchool = selectedSchool === "all" || recruit.schoolId === selectedSchool;

    return matchesSearch && matchesRole && matchesProspectType && matchesStatus && matchesPosition && matchesState && matchesCity && matchesRating && matchesSchool;
  });

  // Get unique positions, states, cities for filters
  const availablePositions = Array.from(new Set(people.map((r) => r.position).filter(Boolean))).sort() as string[];
  const availableStates = Array.from(
    new Set(people.map((r) => r.state).filter((state): state is string => Boolean(state)))
  ).sort();
  const availableCities = Array.from(
    new Set(people.map((r) => r.city).filter((city): city is string => Boolean(city)))
  ).sort();
  const availableSchools = schools;
  const schoolRecruitCounts = new Map<string, number>();
  people.forEach((r) => {
    const key = r.schoolId || r.currentSchool || "unassigned";
    schoolRecruitCounts.set(key, (schoolRecruitCounts.get(key) || 0) + 1);
  });
  const selectedPerson = selectedPersonId ? people.find((p) => p.id === selectedPersonId) : undefined;

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      view: "dashboard" as const,
      icon: <LayoutDashboard className="size-4" />,
      badge: undefined,
    },
    {
      key: "people",
      label: "People",
      view: "people" as const,
      icon: <Users className="size-4" />,
      badge: people.length || undefined,
    },
    {
      key: "schools",
      label: "Schools",
      view: "schools" as const,
      icon: <Building2 className="size-4" />,
      badge: schools.length || undefined,
    },
  ];

  const quickItems = [
    { key: "notifications", label: "Notifications", icon: <Bell className="size-4" />, badge: "48" },
    { key: "tasks", label: "Tasks", icon: <CheckSquare className="size-4" />, badge: "99+" },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {showSplash && (
        <div className={`loading-overlay ${isLoading ? "loading-visible" : "loading-exit"}`}>
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <img
              src={logo}
              alt="Columbia logo"
              className="h-32 w-auto object-contain"
            />
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--ink)]/70">
                Columbia Athletics
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside
          className={`${isNavCollapsed ? "w-16" : "w-64"} border-r border-[var(--border)] bg-[var(--paper)] px-3 py-6 transition-all duration-300 ${isLoading ? "app-prerender" : "app-reveal"}`}
        >
          <div className="mb-6 flex items-center justify-between px-1">
            {!isNavCollapsed && (
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                Ledger
              </div>
            )}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-white/70 text-[var(--ink-muted)] shadow-sm transition hover:text-[var(--ink)]"
              onClick={() => setIsNavCollapsed((prev) => !prev)}
              aria-label={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {isNavCollapsed ? "›" : "‹"}
            </button>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              {!isNavCollapsed && (
                <p className="px-2 text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">Quick</p>
              )}
              <nav className="space-y-1">
                {quickItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-[var(--ink)] transition hover:bg-[var(--muted)]/80 ${isNavCollapsed ? "justify-center" : ""}`}
                    title={item.label}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/80 text-[var(--ink)] shadow-sm">
                      {item.icon}
                    </span>
                    {!isNavCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!isNavCollapsed && item.badge && (
                      <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-[var(--ink)]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-2">
              {!isNavCollapsed && (
                <p className="px-2 text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">Records</p>
              )}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = currentView === item.view;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCurrentView(item.view)}
                      className={`group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition ${
                        active
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                          : "text-[var(--ink)] hover:bg-[var(--muted)]/80"
                      } ${isNavCollapsed ? "justify-center" : ""}`}
                      title={item.label}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-md ${
                          active ? "bg-white/20" : "bg-white/80 text-[var(--ink)]"
                        } shadow-sm`}
                      >
                        {item.icon}
                      </span>
                      {!isNavCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!isNavCollapsed && item.badge !== undefined && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            active ? "bg-white/25 text-[var(--primary-foreground)]" : "bg-[var(--accent)] text-[var(--ink)]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        <div className={`app-shell flex-1 ${isLoading ? "app-prerender" : "app-reveal"}`}>
          <Header />

          <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
            {currentView === "dashboard" && <Dashboard people={people} />}

            {currentView === "people" && (
              <div className="space-y-6">
                {!selectedPerson && (
                  <>
                    <RecruitFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedRole={selectedRole}
                      onRoleChange={setSelectedRole}
                      selectedProspectType={selectedProspectType}
                      onProspectTypeChange={setSelectedProspectType}
                      selectedStatus={selectedStatus}
                      onStatusChange={setSelectedStatus}
                      selectedPosition={selectedPosition}
                      onPositionChange={setSelectedPosition}
                      availablePositions={availablePositions}
                      selectedState={selectedState}
                      onStateChange={setSelectedState}
                      availableStates={availableStates}
                      selectedCity={selectedCity}
                      onCityChange={setSelectedCity}
                      availableCities={availableCities}
                      selectedRating={selectedRating}
                      onRatingChange={setSelectedRating}
                      selectedSchool={selectedSchool}
                      onSchoolChange={setSelectedSchool}
                      availableSchools={availableSchools}
                    />

                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                      <div>
                        <h2 className="font-serif text-xl text-[var(--ink)]">People ledger</h2>
                        <p className="text-sm text-[var(--ink-muted)]">
                          Showing {filteredPeople.length} of {people.length} people
                        </p>
                      </div>
                      <Button variant="secondary" onClick={handleAddRecruit}>
                        Add person
                      </Button>
                    </div>

                    <RecruitTable
                      recruits={filteredPeople}
                      onEdit={handleEditRecruit}
                      onDelete={handleDeleteRecruit}
                      onSelect={(person) => setSelectedPersonId(person.id)}
                    />
                  </>
                )}

                {selectedPerson && (
                  <PersonDetail
                    person={selectedPerson}
                    onBack={() => setSelectedPersonId(null)}
                  />
                )}
              </div>
            )}

            {currentView === "schools" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)]">Directory</p>
                    <h2 className="font-serif text-xl text-[var(--ink)]">Schools</h2>
                    <p className="text-sm text-[var(--ink-muted)]">
                      {schools.length} schools • {people.length} people
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/80">
                  <table className="min-w-full text-left">
                    <thead className="bg-[var(--muted)]/50 text-[var(--ink-muted)]">
                      <tr>
                        <th className="px-4 py-3 text-sm font-semibold">School</th>
                        <th className="px-4 py-3 text-sm font-semibold">Type</th>
                        <th className="px-4 py-3 text-sm font-semibold">Location</th>
                        <th className="px-4 py-3 text-sm font-semibold text-right">Recruits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {schools.map((school) => {
                        const count = people.filter((r) => r.schoolId === school.id).length;
                        return (
                          <tr key={school.id} className="hover:bg-[var(--muted)]/40">
                            <td className="px-4 py-3 text-[var(--ink)]">{school.name}</td>
                            <td className="px-4 py-3 text-[var(--ink-muted)] capitalize">{school.type.replace("-", " ")}</td>
                            <td className="px-4 py-3 text-[var(--ink-muted)]">
                              {[school.city, school.state].filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--ink)] font-semibold">{count}</td>
                          </tr>
                        );
                      })}
                      {schools.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-center text-[var(--ink-muted)]" colSpan={4}>
                            No schools yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>

          <RecruitDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleSaveRecruit}
            recruit={editingPerson}
            mode={dialogMode}
            schools={schools}
          />
        </div>
      </div>
    </div>
  );
}
