import { PersonFull } from "../types/database";

interface DashboardProps {
  people: PersonFull[];
}

export function Dashboard({ people }: DashboardProps) {
  const players = people.filter((p) => p.type === "player");
  const coaches = people.filter((p) => p.type === "coach");
  const staff = people.filter((p) => p.type === "staff");

  const totalPeople = people.length;
  const totalPlayers = players.length;

  // Calculate average rating for players
  const avgRating = players.reduce((sum, p) => {
    if (p.type === "player") {
      const maxpreps = p.rating?.maxpreps || 0;
      return sum + maxpreps;
    }
    return sum;
  }, 0) / (players.length || 1);

  // Calculate institutional allocations (revenue sharing)
  const totalInstitutional = players.reduce((sum, p) => {
    if (p.type === "player" && p.institutional_allocations) {
      return sum + p.institutional_allocations.reduce((s, a) => s + (a.annual_amount || 0), 0);
    }
    return sum;
  }, 0);

  // Calculate external NIL deals (brand income)
  const totalExternalNIL = players.reduce((sum, p) => {
    if (p.type === "player" && p.external_nil_deals) {
      return sum + p.external_nil_deals.reduce((s, d) => s + (d.estimated_amount || 0), 0);
    }
    return sum;
  }, 0);

  // Position counts for players
  const positionCounts = players.reduce((acc, p) => {
    if (p.type === "player") {
      p.player.position.forEach((pos) => {
        acc[pos] = (acc[pos] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topPositions = Object.entries(positionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Priority distribution
  const priorityCounts = players.reduce((acc, p) => {
    if (p.type === "player" && p.player.priority) {
      const priority = p.player.priority;
      acc[priority] = (acc[priority] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total people", value: totalPeople, detail: "All roles" },
          { label: "Players", value: totalPlayers, detail: "Active players" },
          { label: "Coaches", value: coaches.length, detail: `Staff ${staff.length}` },
          { label: "Average rating", value: avgRating.toFixed(1), detail: "MaxPreps" },
          { label: "Institutional", value: `$${(totalInstitutional / 1000).toFixed(0)}K`, detail: "Revenue sharing" },
          { label: "External NIL", value: `$${(totalExternalNIL / 1000).toFixed(0)}K`, detail: "Brand income" },
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
            <h3 className="font-serif text-lg text-[var(--ink)]">Priority distribution</h3>
            <span className="text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">Players</span>
          </div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((priority) => {
              const count = priorityCounts[priority] || 0;
              const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-sm text-[var(--ink-muted)]">
                    <span>Priority {priority}</span>
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
            {topPositions.length > 0 ? (
              topPositions.map(([position, count]) => {
                const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
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
              })
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">No position data yet</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-white/70 p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-serif text-lg text-[var(--ink)]">Recently added</h3>
          <span className="text-xs uppercase tracking-[0.08em] text-[var(--ink-muted)]">Latest five</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {people.slice(-5).reverse().map((person) => {
            const fullName = `${person.first_name} ${person.last_name}`;
            const position = person.type === "player" ? person.player.position.join(", ") : "—";
            const gradYear = person.type === "player" ? person.player.grad_year : undefined;
            const rating = person.type === "player" ? person.rating?.maxpreps : undefined;

            return (
              <div key={person.record_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--ink)]">{fullName}</p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {person.type} • {position} • {person.school?.name || "—"}{gradYear ? ` • Class of ${gradYear}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--ink)]">Rating: {rating || "N/A"}</p>
                  {person.type === "player" && person.player.priority && (
                    <p className="text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                      Priority {person.player.priority}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {people.length === 0 && (
            <p className="py-4 text-center text-[var(--ink-muted)]">No people added yet</p>
          )}
        </div>
      </section>
    </div>
  );
}
