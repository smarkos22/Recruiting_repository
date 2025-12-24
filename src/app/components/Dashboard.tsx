import { Person } from "../types/recruit";

interface DashboardProps {
  people: Person[];
}

export function Dashboard({ people }: DashboardProps) {
  const recruits = people.filter((p) => p.role === "recruit");
  const totalPeople = people.length;
  const totalRecruits = recruits.length;
  const highSchoolRecruits = recruits.filter((r) => r.prospectType === "high-school").length;
  const transferRecruits = recruits.filter((r) => r.prospectType === "transfer").length;
  const committedRecruits = recruits.filter((r) => r.status === "committed" || r.status === "signed").length;
  
  const avgRating = recruits.reduce((sum, r) => {
    const maxpreps = r.ratings?.maxpreps || 0;
    return sum + maxpreps;
  }, 0) / (recruits.length || 1);

  const statusCounts = recruits.reduce((acc, r) => {
    if (r.status) {
      acc[r.status] = (acc[r.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const positionCounts = people.reduce((acc, r) => {
    if (r.position) {
      acc[r.position] = (acc[r.position] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topPositions = Object.entries(positionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total people", value: totalPeople, detail: "All roles" },
          { label: "Recruits", value: totalRecruits, detail: "Active records" },
          { label: "Committed or signed", value: committedRecruits, detail: "Secure outcomes" },
          { label: "Average rating", value: avgRating.toFixed(1), detail: "MaxPreps" },
          { label: "High school vs transfer", value: highSchoolRecruits, detail: `Transfer ${transferRecruits}` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--border)] bg-white/70 p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          >
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">{item.label}</p>
            <p className="mt-2 font-serif text-3xl text-[var(--ink)]">{item.value}</p>
            <p className="text-sm text-[var(--ink-muted)]">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-white/70 p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-serif text-lg text-[var(--ink)]">Status mix</h3>
            <span className="text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">Distribution</span>
          </div>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = (count / totalRecruits) * 100;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-sm text-[var(--ink-muted)]">
                    <span className="capitalize">{status.replace("-", " ")}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white/70 p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-serif text-lg text-[var(--ink)]">Position focus</h3>
            <span className="text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">Top five</span>
          </div>
          <div className="space-y-3">
            {topPositions.map(([position, count]) => {
              const percentage = (count / totalRecruits) * 100;
              return (
                <div key={position} className="space-y-1">
                  <div className="flex justify-between text-sm text-[var(--ink-muted)]">
                    <span className="uppercase tracking-wide">{position}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-2 rounded-full bg-[var(--secondary)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-white/70 p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-serif text-lg text-[var(--ink)]">Recently added</h3>
          <span className="text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">Latest five</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {people.slice(-5).reverse().map((person) => (
            <div key={person.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-[var(--ink)]">{person.name || "Unnamed"}</p>
                <p className="text-sm text-[var(--ink-muted)]">
                  {person.role || "—"} • {person.position || "—"} • {person.currentSchool || "—"}{person.graduationYear ? ` • Class of ${person.graduationYear}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--ink)]">Rating: {person.ratings?.maxpreps || "N/A"}</p>
                {person.status && (
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                    {person.status.replace("-", " ")}
                  </p>
                )}
              </div>
            </div>
          ))}
          {people.length === 0 && (
            <p className="py-4 text-center text-[var(--ink-muted)]">No people added yet</p>
          )}
        </div>
      </section>
    </div>
  );
}
