import { useMemo, useState } from "react";
import { Person } from "../types/recruit";
import { ArrowLeft, MapPin, CalendarClock, CheckCircle2, ListChecks, Globe, Instagram, Twitter, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/Button";

interface PersonDetailProps {
  person: Person;
  onBack: () => void;
}

interface PersonTask {
  id: string;
  title: string;
  status: "open" | "done";
  due?: string;
}

export function PersonDetail({ person, onBack }: PersonDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "socials">("overview");
  const displayName = person.name || "Unnamed person";
  const firstName = person.name?.split(" ")[0] || "player";
  const [tasks] = useState<PersonTask[]>([
    { id: "t1", title: `First touch with ${firstName}`, status: "done", due: "Completed" },
    { id: "t2", title: "Send academic packet", status: "open", due: "Due in 7 days" },
    { id: "t3", title: "Confirm unofficial visit window", status: "open", due: "No date" },
  ]);

  const basics = useMemo(
    () => [
      { label: "City", value: [person.city, person.state].filter(Boolean).join(", ") || "—" },
      { label: "School", value: person.currentSchool || "—" },
      { label: "Position", value: person.position || "—" },
      { label: "Class", value: person.graduationYear || "—" },
      {
        label: "Height / Weight",
        value:
          person.heightFeet && person.heightInches
            ? `${person.heightFeet}'${person.heightInches}" • ${person.weight || "—"}`
            : person.weight || "—",
      },
      { label: "Status", value: person.status || "—" },
    ],
    [person]
  );

  const ratings = useMemo(() => {
    const r = person.ratings || {};
    const entries = [
      r.composite ? { label: "Composite", value: r.composite } : null,
      r.stars247 ? { label: "247Stars", value: r.stars247 } : null,
      r.maxpreps ? { label: "MaxPreps", value: r.maxpreps } : null,
      r.maxprepsRating ? { label: "MaxPreps Rating", value: r.maxprepsRating } : null,
    ].filter(Boolean) as { label: string; value: number }[];
    return entries;
  }, [person]);

  const socials = person.socialMedia || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Back to people
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-muted)]">Person overview</p>
          <h2 className="font-serif text-2xl text-[var(--ink)]">{displayName}</h2>
          <p className="text-[var(--ink-muted)]">
            {person.position || "Role"}, Class of {person.graduationYear || "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[var(--border)] bg-white/80 p-4 shadow-sm">
          <div className="mb-4 flex gap-2">
            {[
              { key: "overview", label: "Overview" },
              { key: "tasks", label: "Tasks" },
              { key: "socials", label: "Socials" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === tab.key ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--ink)] hover:bg-[var(--muted)]/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/40 p-3">
                <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                  <CalendarClock className="size-4" />
                  <span className="text-sm">Last touch</span>
                  <span className="font-medium text-[var(--ink)]">Not tracked</span>
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/40 p-3">
                <div className="flex items-center gap-2 text-[var(--ink-muted)]">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm">Visit window</span>
                  <span className="font-medium text-[var(--ink)]">None scheduled</span>
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-white p-3 shadow-inner">
                <p className="text-sm font-semibold text-[var(--ink)] mb-2">Quick notes</p>
                <p className="text-sm text-[var(--ink-muted)]">
                  Add first contact notes or key intel here once tasks are logged.
                </p>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md border border-[var(--border)] bg-white p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--ink)]">{task.title}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{task.due || "No due date"}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      task.status === "done"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {task.status === "done" ? "Completed" : "Open"}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-[var(--ink-muted)]">No tasks logged yet.</p>
              )}
            </div>
          )}

          {activeTab === "socials" && (
            <div className="space-y-3">
              {socials.twitter && (
                <a className="flex items-center gap-2 text-[var(--primary)] hover:underline" href={socials.twitter} target="_blank" rel="noreferrer">
                  <Twitter className="size-4" /> Twitter
                </a>
              )}
              {socials.instagram && (
                <a className="flex items-center gap-2 text-[var(--primary)] hover:underline" href={socials.instagram} target="_blank" rel="noreferrer">
                  <Instagram className="size-4" /> Instagram
                </a>
              )}
              {socials.hudl && (
                <a className="flex items-center gap-2 text-[var(--primary)] hover:underline" href={socials.hudl} target="_blank" rel="noreferrer">
                  <Globe className="size-4" /> Hudl
                </a>
              )}
              {!socials.twitter && !socials.instagram && !socials.hudl && (
                <p className="text-sm text-[var(--ink-muted)]">No social links on file.</p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-white/80 p-4 shadow-sm">
            <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--ink-muted)]">Vitals</h3>
            <div className="mt-3 space-y-3 text-sm">
              {basics.map((item) => (
                <div key={item.label} className="flex justify-between gap-3 text-[var(--ink)]">
                  <span className="text-[var(--ink-muted)]">{item.label}</span>
                  <span className="font-semibold">{item.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-white/80 p-4 shadow-sm">
            <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--ink-muted)]">Ratings</h3>
            <div className="mt-3 space-y-2 text-sm">
              {ratings.length > 0 ? (
                ratings.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[var(--ink)]">
                    <span className="text-[var(--ink-muted)]">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-[var(--ink-muted)]">No ratings yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-white/80 p-4 shadow-sm">
            <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--ink-muted)]">Links</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <LinkIcon className="size-4" />
                <span>Profile</span>
              </div>
              <p className="break-all text-[var(--ink-muted)]">{person.socialMedia?.maxpreps || "No external profile"}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
