import { PersonFull, School, PositionValue, Position, CoachSpecialty, CoachSpecialtyValue, StaffSpecialty, StaffSpecialtyValue, SchoolInput } from "../types/database";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useEffect } from "react";
import { updatePlayer, updateCoach, updateStaff, getAllSchools, updatePlayerRating, createSchool } from "../services/storage";
import { SchoolDialog } from "./SchoolDialog";

interface PersonDetailProps {
  person: PersonFull;
  onBack: () => void;
  onUpdate?: () => void;
}

export function PersonDetail({ person, onBack, onUpdate }: PersonDetailProps) {
  const [editedPerson, setEditedPerson] = useState<PersonFull>(person);
  const [schools, setSchools] = useState<School[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSchoolDialogOpen, setIsSchoolDialogOpen] = useState(false);

  useEffect(() => {
    setEditedPerson(person);
  }, [person]);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    const allSchools = await getAllSchools();
    setSchools(allSchools);
  };

  const handleCreateSchool = async (schoolInput: SchoolInput) => {
    try {
      const newSchool = await createSchool(schoolInput);
      await loadSchools();
      // Automatically select the newly created school
      setEditedPerson({ ...editedPerson, school_id: newSchool.record_id });
    } catch (error) {
      console.error("Failed to create school:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editedPerson.type === "player") {
        await updatePlayer(editedPerson.record_id, {
          person: {
            first_name: editedPerson.first_name,
            last_name: editedPerson.last_name,
            email: editedPerson.email,
            phone: editedPerson.phone,
            twitter_url: editedPerson.twitter_url,
            instagram_url: editedPerson.instagram_url,
            linkedin_url: editedPerson.linkedin_url,
            facebook_url: editedPerson.facebook_url,
            tiktok_url: editedPerson.tiktok_url,
            type: "player",
            school_id: editedPerson.school_id,
          },
          player: {
            position: editedPerson.player.position,
            grad_year: editedPerson.player.grad_year,
            years_eligibility: editedPerson.player.years_eligibility,
            priority: editedPerson.player.priority,
            likelihood: editedPerson.player.likelihood,
          },
        });

        // Update rating separately
        if (editedPerson.rating) {
          await updatePlayerRating(editedPerson.record_id, {
            maxpreps: editedPerson.rating.maxpreps,
            rating_247: editedPerson.rating.rating_247,
            composite_247: editedPerson.rating.composite_247,
            internal_rating: editedPerson.rating.internal_rating,
          });
        }
      } else if (editedPerson.type === "coach") {
        await updateCoach(editedPerson.record_id, {
          person: {
            first_name: editedPerson.first_name,
            last_name: editedPerson.last_name,
            email: editedPerson.email,
            phone: editedPerson.phone,
            twitter_url: editedPerson.twitter_url,
            instagram_url: editedPerson.instagram_url,
            linkedin_url: editedPerson.linkedin_url,
            facebook_url: editedPerson.facebook_url,
            tiktok_url: editedPerson.tiktok_url,
            type: "coach",
            school_id: editedPerson.school_id,
          },
          coach: {
            specialty: editedPerson.coach.specialty,
            committed_salary: editedPerson.coach.committed_salary,
            estimated_salary: editedPerson.coach.estimated_salary,
          },
        });
      } else if (editedPerson.type === "staff") {
        await updateStaff(editedPerson.record_id, {
          person: {
            first_name: editedPerson.first_name,
            last_name: editedPerson.last_name,
            email: editedPerson.email,
            phone: editedPerson.phone,
            twitter_url: editedPerson.twitter_url,
            instagram_url: editedPerson.instagram_url,
            linkedin_url: editedPerson.linkedin_url,
            facebook_url: editedPerson.facebook_url,
            tiktok_url: editedPerson.tiktok_url,
            type: "staff",
            school_id: editedPerson.school_id,
          },
          staff: {
            specialty: editedPerson.staff.specialty,
          },
        });
      }

      await onUpdate?.();
      onBack(); // Return to the People Ledger after saving
    } catch (error) {
      console.error("Failed to update person:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const fullName = `${editedPerson.first_name} ${editedPerson.last_name}`;

  const inputClass = "w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[var(--ink)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]";
  const labelClass = "text-sm font-medium text-[var(--ink-muted)]";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white/70 p-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[var(--ink)]">{fullName}</h1>
          <p className="text-lg text-[var(--ink-muted)] capitalize">{editedPerson.type}</p>
        </div>

        {/* Basic Information */}
        <div className="mb-6 space-y-4 border-b border-[var(--border)] pb-6">
          <h2 className="font-serif text-xl text-[var(--ink)]">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={editedPerson.first_name}
                onChange={(e) => setEditedPerson({ ...editedPerson, first_name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={editedPerson.last_name}
                onChange={(e) => setEditedPerson({ ...editedPerson, last_name: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6 space-y-4 border-b border-[var(--border)] pb-6">
          <h2 className="font-serif text-xl text-[var(--ink)]">Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={editedPerson.email || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, email: e.target.value || undefined })}
                className={inputClass}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={editedPerson.phone || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, phone: e.target.value || undefined })}
                className={inputClass}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>School</label>
              <div className="flex gap-2">
                <select
                  value={editedPerson.school_id || ""}
                  onChange={(e) => setEditedPerson({ ...editedPerson, school_id: e.target.value || undefined })}
                  className={`${inputClass} flex-1`}
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school.record_id} value={school.record_id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  onClick={() => setIsSchoolDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  Add New
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mb-6 space-y-4 border-b border-[var(--border)] pb-6">
          <h2 className="font-serif text-xl text-[var(--ink)]">Social Media</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Twitter URL</label>
              <input
                type="url"
                value={editedPerson.twitter_url || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, twitter_url: e.target.value || undefined })}
                className={inputClass}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input
                type="url"
                value={editedPerson.instagram_url || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, instagram_url: e.target.value || undefined })}
                className={inputClass}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                type="url"
                value={editedPerson.linkedin_url || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, linkedin_url: e.target.value || undefined })}
                className={inputClass}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input
                type="url"
                value={editedPerson.facebook_url || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, facebook_url: e.target.value || undefined })}
                className={inputClass}
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className={labelClass}>TikTok URL</label>
              <input
                type="url"
                value={editedPerson.tiktok_url || ""}
                onChange={(e) => setEditedPerson({ ...editedPerson, tiktok_url: e.target.value || undefined })}
                className={inputClass}
                placeholder="https://tiktok.com/@username"
              />
            </div>
          </div>
        </div>

        {/* Player-specific information */}
        {editedPerson.type === "player" && (
          <div className="space-y-4 border-b border-[var(--border)] pb-6">
            <h2 className="font-serif text-xl text-[var(--ink)]">Player Information</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Position(s)</label>
                <select
                  multiple
                  value={editedPerson.player.position}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value as PositionValue);
                    setEditedPerson({
                      ...editedPerson,
                      player: { ...editedPerson.player, position: selected }
                    });
                  }}
                  className={`${inputClass} h-32`}
                >
                  {Object.values(Position).map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className={labelClass}>Graduation Year</label>
                <input
                  type="number"
                  value={editedPerson.player.grad_year || ""}
                  onChange={(e) => setEditedPerson({
                    ...editedPerson,
                    player: { ...editedPerson.player, grad_year: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className={inputClass}
                  placeholder="2025"
                />
              </div>
              <div>
                <label className={labelClass}>Years Eligibility</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={editedPerson.player.years_eligibility || ""}
                  onChange={(e) => setEditedPerson({
                    ...editedPerson,
                    player: { ...editedPerson.player, years_eligibility: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className={inputClass}
                  placeholder="4"
                />
              </div>
              <div>
                <label className={labelClass}>Priority (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editedPerson.player.priority || ""}
                  onChange={(e) => setEditedPerson({
                    ...editedPerson,
                    player: { ...editedPerson.player, priority: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className={inputClass}
                  placeholder="3"
                />
              </div>
              <div>
                <label className={labelClass}>Likelihood (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editedPerson.player.likelihood || ""}
                  onChange={(e) => setEditedPerson({
                    ...editedPerson,
                    player: { ...editedPerson.player, likelihood: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className={inputClass}
                  placeholder="3"
                />
              </div>
            </div>

            {/* Ratings */}
            <div className="mt-4">
              <h3 className="mb-3 font-serif text-lg text-[var(--ink)]">Ratings</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className={labelClass}>MaxPreps (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editedPerson.rating?.maxpreps || ""}
                    onChange={(e) => setEditedPerson({
                      ...editedPerson,
                      rating: {
                        record_id: editedPerson.rating?.record_id || "",
                        player_id: editedPerson.record_id,
                        maxpreps: e.target.value ? parseInt(e.target.value) : undefined,
                        rating_247: editedPerson.rating?.rating_247,
                        composite_247: editedPerson.rating?.composite_247,
                        internal_rating: editedPerson.rating?.internal_rating,
                        created_at: editedPerson.rating?.created_at || "",
                        updated_at: editedPerson.rating?.updated_at || "",
                      }
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>247 Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editedPerson.rating?.rating_247 || ""}
                    onChange={(e) => setEditedPerson({
                      ...editedPerson,
                      rating: {
                        record_id: editedPerson.rating?.record_id || "",
                        player_id: editedPerson.record_id,
                        maxpreps: editedPerson.rating?.maxpreps,
                        rating_247: e.target.value ? parseInt(e.target.value) : undefined,
                        composite_247: editedPerson.rating?.composite_247,
                        internal_rating: editedPerson.rating?.internal_rating,
                        created_at: editedPerson.rating?.created_at || "",
                        updated_at: editedPerson.rating?.updated_at || "",
                      }
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>247 Composite</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedPerson.rating?.composite_247 || ""}
                    onChange={(e) => setEditedPerson({
                      ...editedPerson,
                      rating: {
                        record_id: editedPerson.rating?.record_id || "",
                        player_id: editedPerson.record_id,
                        maxpreps: editedPerson.rating?.maxpreps,
                        rating_247: editedPerson.rating?.rating_247,
                        composite_247: e.target.value ? parseFloat(e.target.value) : undefined,
                        internal_rating: editedPerson.rating?.internal_rating,
                        created_at: editedPerson.rating?.created_at || "",
                        updated_at: editedPerson.rating?.updated_at || "",
                      }
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Internal Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editedPerson.rating?.internal_rating || ""}
                    onChange={(e) => setEditedPerson({
                      ...editedPerson,
                      rating: {
                        record_id: editedPerson.rating?.record_id || "",
                        player_id: editedPerson.record_id,
                        maxpreps: editedPerson.rating?.maxpreps,
                        rating_247: editedPerson.rating?.rating_247,
                        composite_247: editedPerson.rating?.composite_247,
                        internal_rating: e.target.value ? parseInt(e.target.value) : undefined,
                        created_at: editedPerson.rating?.created_at || "",
                        updated_at: editedPerson.rating?.updated_at || "",
                      }
                    })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Display NIL information (read-only for now) */}
            {editedPerson.institutional_allocations && editedPerson.institutional_allocations.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-serif text-lg text-[var(--ink)]">Institutional Allocations</h3>
                <p className="mb-3 text-xs text-[var(--ink-muted)]">Revenue sharing payments from the school</p>
                <div className="space-y-3">
                  {editedPerson.institutional_allocations.map((alloc) => (
                    <div key={alloc.record_id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-[var(--ink-muted)]">Type</p>
                          <p className="text-sm font-medium text-[var(--ink)] capitalize">{alloc.allocation_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--ink-muted)]">Amount</p>
                          <p className="text-sm font-medium text-[var(--ink)]">
                            {alloc.annual_amount ? `$${alloc.annual_amount.toLocaleString()}/yr` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--ink-muted)]">Status</p>
                          <p className="text-sm font-medium text-[var(--ink)] capitalize">{alloc.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editedPerson.external_nil_deals && editedPerson.external_nil_deals.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-serif text-lg text-[var(--ink)]">External NIL Deals</h3>
                <p className="mb-3 text-xs text-[var(--ink-muted)]">Third-party brand deals and marketplace income</p>
                <div className="space-y-3">
                  {editedPerson.external_nil_deals.map((deal) => (
                    <div key={deal.record_id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-[var(--ink-muted)]">Source</p>
                          <p className="text-sm font-medium text-[var(--ink)] capitalize">{deal.source_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--ink-muted)]">Estimated Value</p>
                          <p className="text-sm font-medium text-[var(--ink)]">
                            {deal.estimated_amount ? `$${deal.estimated_amount.toLocaleString()}` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--ink-muted)]">Deliverables</p>
                          <p className="text-sm text-[var(--ink)]">{deal.deliverables_required ? 'Required' : 'None'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coach-specific information */}
        {editedPerson.type === "coach" && (
          <div className="space-y-4 border-b border-[var(--border)] pb-6">
            <h2 className="font-serif text-xl text-[var(--ink)]">Coach Information</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Specialty/Specialties</label>
                <select
                  multiple
                  value={editedPerson.coach.specialty}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value as CoachSpecialtyValue);
                    setEditedPerson({
                      ...editedPerson,
                      coach: { ...editedPerson.coach, specialty: selected }
                    });
                  }}
                  className={`${inputClass} h-32`}
                >
                  {Object.values(CoachSpecialty).map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className={labelClass}>Committed Salary</label>
                <input
                  type="number"
                  value={editedPerson.coach.committed_salary || ""}
                  onChange={(e) => setEditedPerson({
                    ...editedPerson,
                    coach: { ...editedPerson.coach, committed_salary: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className={inputClass}
                  placeholder="100000"
                />
              </div>
              <div>
                <label className={labelClass}>Estimated Salary</label>
                <input
                  type="number"
                  value={editedPerson.coach.estimated_salary || ""}
                  onChange={(e) => setEditedPerson({
                    ...editedPerson,
                    coach: { ...editedPerson.coach, estimated_salary: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  className={inputClass}
                  placeholder="120000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Staff-specific information */}
        {editedPerson.type === "staff" && (
          <div className="space-y-4 border-b border-[var(--border)] pb-6">
            <h2 className="font-serif text-xl text-[var(--ink)]">Staff Information</h2>
            <div>
              <label className={labelClass}>Specialty/Specialties</label>
              <select
                multiple
                value={editedPerson.staff.specialty}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value as StaffSpecialtyValue);
                  setEditedPerson({
                    ...editedPerson,
                    staff: { ...editedPerson.staff, specialty: selected }
                  });
                }}
                className={`${inputClass} h-32`}
              >
                {Object.values(StaffSpecialty).map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        )}

        {/* Tasks */}
        {editedPerson.tasks && editedPerson.tasks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-serif text-xl text-[var(--ink)]">Tasks</h2>
            <div className="space-y-2">
              {editedPerson.tasks.map((task) => (
                <div key={task.record_id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[var(--ink)]">{task.description}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        Status: {task.status}
                        {task.due_date && ` • Due: ${new Date(task.due_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SchoolDialog
        isOpen={isSchoolDialogOpen}
        onClose={() => setIsSchoolDialogOpen(false)}
        onSave={handleCreateSchool}
      />
    </div>
  );
}
