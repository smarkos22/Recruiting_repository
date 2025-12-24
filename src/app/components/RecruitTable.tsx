import { Person } from "../types/recruit";
import { Star, MapPin } from "lucide-react";
import { Button } from "./ui/Button";

interface RecruitTableProps {
  recruits: Person[];
  onEdit: (recruit: Person) => void;
  onDelete: (id: string) => void;
  onSelect?: (recruit: Person) => void;
}

export function RecruitTable({
  recruits,
  onEdit,
  onDelete,
  onSelect,
}: RecruitTableProps) {
  const renderStars = (rating: number | undefined) => {
    if (!rating)
      return <span className="text-gray-400">N/A</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-3 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (recruits.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-white/70 p-12 text-center">
        <h3 className="font-serif text-lg text-[var(--ink)] mb-2">No people found</h3>
        <p className="text-[var(--ink-muted)]">
          Add your first person to begin your ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)] text-left text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Links</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {recruits.map((recruit) => {
              const socials = recruit.socialMedia || {};
              const maxpreps = recruit.ratings?.maxpreps;

              return (
                <tr
                  key={recruit.id}
                  className={`align-top ${onSelect ? "cursor-pointer hover:bg-[var(--muted)]/40" : ""}`}
                  onClick={() => onSelect?.(recruit)}
                >
                  <td className="px-4 py-3 text-[var(--ink)]">
                    <div className="font-medium">{recruit.name || "Unnamed"}</div>
                    <div className="text-[var(--ink-muted)]">{recruit.currentSchool || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-[var(--border)] bg-[var(--input-background)] px-2 py-1 text-xs uppercase tracking-wide text-[var(--ink)]">
                      {recruit.role || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">
                    <p>{recruit.currentSchool || "—"}</p>
                    <p className="text-xs text-[var(--ink-muted)]">Added {new Date(recruit.dateAdded).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-muted)]">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {[recruit.city, recruit.state].filter(Boolean).join(", ") || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">
                    {recruit.position || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">
                    {recruit.graduationYear || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">
                    {maxpreps ? (
                      <div className="flex items-center gap-2">
                        <span>{maxpreps}</span>
                        {renderStars(maxpreps)}
                      </div>
                    ) : (
                      <span className="text-[var(--ink-muted)]">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs text-[var(--primary)]">
                      {socials.twitter && (
                        <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Twitter
                        </a>
                      )}
                      {socials.hudl && (
                        <a href={socials.hudl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Hudl
                        </a>
                      )}
                      {socials.instagram && (
                        <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Instagram
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {recruit.status ? (
                      <span className="inline-flex items-center rounded-md border border-[var(--border)] px-2 py-1 text-xs uppercase tracking-wide text-[var(--ink)]">
                        {recruit.status.replace("-", " ")}
                      </span>
                    ) : (
                      <span className="text-[var(--ink-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(recruit);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(recruit.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
