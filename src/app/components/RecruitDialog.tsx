import { useState, useEffect } from "react";
import { Person, ProspectType, RecruitStatus, School, PersonRole } from "../types/recruit";
import { X } from "lucide-react";
import { Button } from "./ui/Button";

interface RecruitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recruit: Omit<Person, "id" | "dateAdded"> & { id?: string }) => void;
  recruit?: Person;
  mode: "add" | "edit";
  schools: School[];
}

export function RecruitDialog({ isOpen, onClose, onSave, recruit, mode, schools }: RecruitDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "player" as PersonRole,
    prospectType: "high-school" as ProspectType,
    currentSchool: "",
    schoolId: "",
    city: "",
    state: "",
    position: "",
    graduationYear: new Date().getFullYear() + 1,
    heightFeet: "",
    heightInches: "",
    weight: "",
    email: "",
    phone: "",
    status: "contacted" as RecruitStatus,
    notes: "",
    twitter: "",
    instagram: "",
    hudl: "",
    maxpreps: "",
    stars247: "",
    starsRivals: "",
    starsESPN: "",
    starsOn3: "",
    composite: "",
    maxprepsRating: "",
  });

  useEffect(() => {
    if (recruit && mode === "edit") {
      const matchedSchool = recruit.schoolId || schools.find((s) => s.name === recruit.currentSchool)?.id || "";
      setFormData({
        name: recruit.name || "",
        role: recruit.role || "player",
        prospectType: recruit.prospectType || "high-school",
        currentSchool: recruit.currentSchool || "",
        schoolId: matchedSchool,
        city: recruit.city || "",
        state: recruit.state || "",
        position: recruit.position || "",
        graduationYear: recruit.graduationYear || new Date().getFullYear() + 1,
        heightFeet: recruit.heightFeet?.toString() || "",
        heightInches: recruit.heightInches?.toString() || "",
        weight: recruit.weight || "",
        email: recruit.email || "",
        phone: recruit.phone || "",
        status: recruit.status || "contacted",
        notes: recruit.notes || "",
        twitter: recruit.socialMedia?.twitter || "",
        instagram: recruit.socialMedia?.instagram || "",
        hudl: recruit.socialMedia?.hudl || "",
        maxpreps: recruit.socialMedia?.maxpreps || "",
        stars247: recruit.ratings?.stars247?.toString() || "",
        starsRivals: recruit.ratings?.starsRivals?.toString() || "",
        starsESPN: recruit.ratings?.starsESPN?.toString() || "",
        starsOn3: recruit.ratings?.starsOn3?.toString() || "",
        composite: recruit.ratings?.composite?.toString() || "",
        maxprepsRating: recruit.ratings?.maxprepsRating?.toString() || "",
      });
    }
  }, [recruit, mode]);

  const handleSchoolChange = (schoolId: string) => {
    const selected = schools.find((s) => s.id === schoolId);
    setFormData((prev) => ({
      ...prev,
      schoolId,
      currentSchool: selected?.name || prev.currentSchool,
      city: selected?.city || prev.city,
      state: selected?.state || prev.state,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recruitData = {
      ...(mode === "edit" && recruit ? { id: recruit.id } : {}),
      name: formData.name,
      role: formData.role,
      prospectType: formData.role === "recruit" ? formData.prospectType : undefined,
      currentSchool: formData.currentSchool,
      city: formData.city,
      state: formData.state,
      schoolId: formData.schoolId || undefined,
      position: formData.position || undefined,
      graduationYear: formData.role === "recruit" || formData.role === "player" ? formData.graduationYear : undefined,
      heightFeet: formData.heightFeet ? parseInt(formData.heightFeet, 10) : undefined,
      heightInches: formData.heightInches ? parseInt(formData.heightInches, 10) : undefined,
      weight: formData.weight || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      status: formData.role === "recruit" ? formData.status : undefined,
      notes: formData.notes || undefined,
      socialMedia: {
        twitter: formData.twitter || undefined,
        instagram: formData.instagram || undefined,
        hudl: formData.hudl || undefined,
        maxpreps: formData.maxpreps || undefined,
      },
      ratings: {
        stars247: formData.stars247 ? parseInt(formData.stars247) : undefined,
        starsRivals: formData.starsRivals ? parseInt(formData.starsRivals) : undefined,
        starsESPN: formData.starsESPN ? parseInt(formData.starsESPN) : undefined,
        starsOn3: formData.starsOn3 ? parseInt(formData.starsOn3) : undefined,
        composite: formData.composite ? parseFloat(formData.composite) : undefined,
        maxprepsRating: formData.maxprepsRating ? parseInt(formData.maxprepsRating) : undefined,
      },
    };

    onSave(recruitData);
    onClose();
    
    // Reset form
    if (mode === "add") {
      setFormData({
        name: "",
        role: "player",
        prospectType: "high-school",
        currentSchool: "",
        city: "",
        state: "",
        schoolId: "",
        position: "",
        graduationYear: new Date().getFullYear() + 1,
        heightFeet: "",
        heightInches: "",
        weight: "",
        email: "",
        phone: "",
        status: "contacted",
        notes: "",
        twitter: "",
        instagram: "",
        hudl: "",
        maxpreps: "",
        stars247: "",
        starsRivals: "",
        starsESPN: "",
        starsOn3: "",
        composite: "",
        maxprepsRating: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,17,15,0.55)] p-4">
      <div className="w-full max-h-[90vh] max-w-4xl overflow-y-auto rounded-lg border border-[var(--border)] bg-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-white/95 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-muted)]">Record</p>
            <h2 className="font-serif text-xl text-[var(--ink)]">{mode === "add" ? "Add new person" : "Edit person"}</h2>
          </div>
          <button onClick={onClose} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4 font-serif text-lg text-[var(--ink)]">Basic information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as PersonRole })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="recruit">Recruit</option>
                  <option value="coach">Coach</option>
                  <option value="player">Player</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Position</label>
                <input
                  type="text"
                  placeholder="e.g., QB, WR, RB"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {formData.role === "recruit" && (
                <div>
                  <label className="mb-1 block text-sm text-[var(--ink-muted)]">Prospect Type</label>
                  <select
                    value={formData.prospectType}
                    onChange={(e) => setFormData({ ...formData, prospectType: e.target.value as ProspectType })}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="high-school">High School</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              )}

              {(formData.role === "recruit" || formData.role === "player") && (
                <div>
                  <label className="mb-1 block text-sm text-[var(--ink-muted)]">Graduation Year</label>
                  <input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Height</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Feet"
                    value={formData.heightFeet}
                    onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                  <input
                    type="number"
                    min={0}
                    max={11}
                    placeholder="Inches"
                    value={formData.heightInches}
                    onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Weight</label>
                <input
                  type="text"
                  placeholder="e.g., 185 lbs"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {formData.role === "recruit" && (
                <div>
                  <label className="mb-1 block text-sm text-[var(--ink-muted)]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RecruitStatus })}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="contacted">Contacted</option>
                    <option value="offered">Offered</option>
                    <option value="visited">Visited</option>
                    <option value="committed">Committed</option>
                    <option value="signed">Signed</option>
                    <option value="not-interested">Not Interested</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* School & Location */}
          <div>
            <h3 className="mb-4 font-serif text-lg text-[var(--ink)]">School & Location</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">School *</label>
                <select
                  required
                  value={formData.schoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="">Select school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} {school.city ? `• ${school.city}, ${school.state || ""}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CA"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 font-serif text-lg text-[var(--ink)]">Contact information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4 font-serif text-lg text-[var(--ink)]">Social media & video</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Twitter/X URL</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Instagram URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Hudl URL</label>
                <input
                  type="url"
                  placeholder="https://hudl.com/..."
                  value={formData.hudl}
                  onChange={(e) => setFormData({ ...formData, hudl: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">MaxPreps URL</label>
                <input
                  type="url"
                  placeholder="https://maxpreps.com/..."
                  value={formData.maxpreps}
                  onChange={(e) => setFormData({ ...formData, maxpreps: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h3 className="mb-4 font-serif text-lg text-[var(--ink)]">MaxPreps rating</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-[var(--ink-muted)]">Star Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="1"
                  placeholder="1-5"
                  value={formData.maxprepsRating}
                  onChange={(e) => setFormData({ ...formData, maxprepsRating: e.target.value })}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm text-[var(--ink-muted)]">Notes</label>
            <textarea
              rows={4}
              placeholder="Add any additional notes about this recruit..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Add Recruit" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
