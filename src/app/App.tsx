import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Building2, Bell, CheckSquare, ChevronDown, UserSquare2, GraduationCap, Briefcase } from "lucide-react";
import { PersonFull, School, PersonTypeValue, PositionValue } from "./types/database";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { RecruitFilters } from "./components/RecruitFilters";
import { RecruitTable } from "./components/RecruitTable";
import { RecruitDialog } from "./components/RecruitDialog";
import { Button } from "./components/ui/Button";
import { PersonDetail } from "./components/PersonDetail";
import {
  initDatabase,
  getAllPeople,
  getAllSchoolsWithCounts,
  deletePerson,
} from "./services/storage";
import { seedSampleData } from "./services/sampleData";
import logo from "../assets/columbia-logo.jpg";

export default function App() {
  const [people, setPeople] = useState<PersonFull[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [currentView, setCurrentView] = useState<"dashboard" | "people" | "schools">("dashboard");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingPerson, setEditingPerson] = useState<PersonFull | undefined>();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<PersonTypeValue | "all">("all");
  const [selectedPosition, setSelectedPosition] = useState<PositionValue | "all">("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState<string | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPeopleExpanded, setIsPeopleExpanded] = useState(false);
  const [selectedPeopleSubView, setSelectedPeopleSubView] = useState<PersonTypeValue | null>(null);

  // Initialize database and load data
  useEffect(() => {
    async function loadData() {
      try {
        // Initialize IndexedDB
        await initDatabase();

        // Seed sample data if empty
        await seedSampleData();

        // Load all data
        const allPeople = await getAllPeople();
        const allSchools = await getAllSchoolsWithCounts();

        setPeople(allPeople);
        setSchools(allSchools);
        setDataLoaded(true);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }

    loadData();
  }, []);

  // Refresh data helper
  const refreshData = async () => {
    try {
      const allPeople = await getAllPeople();
      const allSchools = await getAllSchoolsWithCounts();
      setPeople(allPeople);
      setSchools(allSchools);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

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

  const handleSaveRecruit = async (personData: any) => {
    try {
      const { type } = personData;
      let newPerson: PersonFull | undefined;

      // Create a minimal person based on type
      if (type === "player") {
        const { createPlayer } = await import("./services/storage");
        newPerson = await createPlayer({
          person: {
            first_name: "New",
            last_name: "Player",
            type: "player",
          },
          player: {
            position: [],
          },
        });
      } else if (type === "coach") {
        const { createCoach } = await import("./services/storage");
        newPerson = await createCoach({
          person: {
            first_name: "New",
            last_name: "Coach",
            type: "coach",
          },
          coach: {
            specialty: [],
          },
        });
      } else if (type === "staff") {
        const { createStaff } = await import("./services/storage");
        newPerson = await createStaff({
          person: {
            first_name: "New",
            last_name: "Staff",
            type: "staff",
          },
          staff: {
            specialty: [],
          },
        });
      }

      await refreshData();
      setIsDialogOpen(false);

      // Navigate to person detail view for editing
      if (newPerson) {
        setSelectedPersonId(newPerson.record_id);
        setCurrentView("people");
      }
    } catch (error) {
      console.error("Failed to save person:", error);
    }
  };

  const handleDeleteRecruit = async (id: string) => {
    if (confirm("Are you sure you want to delete this person?")) {
      try {
        await deletePerson(id);
        await refreshData();
      } catch (error) {
        console.error("Failed to delete person:", error);
      }
    }
  };

  // Filter people
  const filteredPeople = people.filter((person) => {
    const searchName = `${person.first_name} ${person.last_name}`;
    const searchSchool = person.school?.name || "";
    const matchesSearch =
      searchQuery === "" ||
      searchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchSchool.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || person.type === selectedRole;

    // Position filter only applies to players
    const matchesPosition =
      selectedPosition === "all" ||
      (person.type === "player" && person.player.position.includes(selectedPosition));

    const matchesState = selectedState === "all" || person.school?.state === selectedState;

    const matchesCity = selectedCity === "all" || person.school?.city === selectedCity;

    const matchesRating =
      selectedRating === "all" ||
      (person.type === "player" && person.rating?.maxpreps === parseInt(selectedRating));

    const matchesSchool = selectedSchool === "all" || person.school_id === selectedSchool;

    return matchesSearch && matchesRole && matchesPosition && matchesState && matchesCity && matchesRating && matchesSchool;
  });

  // Get unique positions, states, cities for filters
  const availablePositions = Array.from(
    new Set(
      people
        .filter((p) => p.type === "player")
        .flatMap((p) => (p.type === "player" ? p.player.position : []))
    )
  ).sort();

  const availableStates = Array.from(
    new Set(people.map((p) => p.school?.state).filter((state): state is string => Boolean(state)))
  ).sort();

  const availableCities = Array.from(
    new Set(people.map((p) => p.school?.city).filter((city): city is string => Boolean(city)))
  ).sort();

  const availableSchools = schools;

  const selectedPerson = selectedPersonId ? people.find((p) => p.record_id === selectedPersonId) : undefined;

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
                  const isPeopleItem = item.key === "people";

                  return (
                    <div key={item.key}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isPeopleItem) {
                            setIsPeopleExpanded(!isPeopleExpanded);
                            setCurrentView(item.view);
                          } else {
                            setCurrentView(item.view);
                            setIsPeopleExpanded(false);
                          }
                        }}
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
                        {!isNavCollapsed && isPeopleItem && (
                          <ChevronDown
                            className={`size-4 transition-transform ${isPeopleExpanded ? "rotate-180" : ""}`}
                          />
                        )}
                        {!isNavCollapsed && item.badge !== undefined && !isPeopleItem && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              active ? "bg-white/25 text-[var(--primary-foreground)]" : "bg-[var(--accent)] text-[var(--ink)]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>

                      {/* People Sub-items */}
                      {isPeopleItem && isPeopleExpanded && !isNavCollapsed && (
                        <div className="ml-2 mt-1 space-y-1">
                          {[
                            {
                              key: "player",
                              label: "Players",
                              icon: <GraduationCap className="size-4" />,
                              count: people.filter(p => p.type === "player").length
                            },
                            {
                              key: "coach",
                              label: "Coaches",
                              icon: <UserSquare2 className="size-4" />,
                              count: people.filter(p => p.type === "coach").length
                            },
                            {
                              key: "staff",
                              label: "Staff",
                              icon: <Briefcase className="size-4" />,
                              count: people.filter(p => p.type === "staff").length
                            },
                          ].map((subItem) => {
                            const isSubActive = selectedPeopleSubView === subItem.key;
                            return (
                              <button
                                key={subItem.key}
                                type="button"
                                onClick={() => {
                                  setSelectedPeopleSubView(subItem.key as PersonTypeValue);
                                  setSelectedRole(subItem.key as PersonTypeValue);
                                }}
                                className={`group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition ${
                                  isSubActive
                                    ? "bg-[rgba(21,63,43,0.55)] text-[var(--primary-foreground)] shadow-sm border border-[var(--primary-foreground)]"
                                    : "bg-white/80 text-[var(--ink)] hover:bg-[var(--muted)]/80 border border-[var(--border)] shadow-sm"
                                }`}
                              >
                                <span
                                  className={`flex h-9 w-9 items-center justify-center rounded-md ${
                                    isSubActive ? "bg-white/20 border border-[var(--primary-foreground)]" : "bg-white/20 text-[var(--ink)]"
                                  } shadow-sm`}
                                >
                                  {subItem.icon}
                                </span>
                                <span className="flex-1 truncate">{subItem.label}</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    isSubActive ? "bg-white/25 text-[var(--primary-foreground)]" : "bg-[var(--accent)] text-[var(--ink)]"
                                  }`}
                                >
                                  {subItem.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
                      onDelete={handleDeleteRecruit}
                      onSelect={(person) => setSelectedPersonId(person.record_id)}
                    />
                  </>
                )}

                {selectedPerson && (
                  <PersonDetail
                    person={selectedPerson}
                    onBack={() => setSelectedPersonId(null)}
                    onUpdate={refreshData}
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
                        const typesDisplay = school.type.join(", ");
                        const totalCount =
                          "player_count" in school
                            ? school.player_count + school.coach_count + school.staff_count
                            : people.filter((p) => p.school_id === school.record_id).length;

                        return (
                          <tr key={school.record_id} className="hover:bg-[var(--muted)]/40">
                            <td className="px-4 py-3 text-[var(--ink)]">{school.name}</td>
                            <td className="px-4 py-3 text-[var(--ink-muted)]">{typesDisplay}</td>
                            <td className="px-4 py-3 text-[var(--ink-muted)]">
                              {[school.city, school.state].filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--ink)] font-semibold">{totalCount}</td>
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
