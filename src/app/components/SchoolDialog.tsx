import { School, SchoolInput, SchoolTypeValue, SchoolType, USState, USStates } from "../types/database";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { useState } from "react";

interface SchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (school: SchoolInput) => void;
}

export function SchoolDialog({ isOpen, onClose, onSave }: SchoolDialogProps) {
  const [schoolData, setSchoolData] = useState<SchoolInput>({
    name: "",
    city: undefined,
    state: undefined,
    type: [],
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate required fields
    const newErrors: { name?: string } = {};
    if (!schoolData.name.trim()) {
      newErrors.name = "School name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(schoolData);
    // Reset form
    setSchoolData({
      name: "",
      city: undefined,
      state: undefined,
      type: [],
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setSchoolData({
      name: "",
      city: undefined,
      state: undefined,
      type: [],
    });
    setErrors({});
    onClose();
  };

  const inputClass = "w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[var(--ink)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]";
  const labelClass = "text-sm font-medium text-[var(--ink)]";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[var(--ink)]">
            Add New School
          </h2>
          <button
            onClick={handleCancel}
            className="rounded-md p-2 text-[var(--ink-muted)] hover:bg-[var(--muted)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              School Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={schoolData.name}
              onChange={(e) => {
                setSchoolData({ ...schoolData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`${inputClass} ${errors.name ? "border-red-600" : ""}`}
              placeholder="Enter school name"
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={schoolData.city || ""}
                onChange={(e) => setSchoolData({ ...schoolData, city: e.target.value || undefined })}
                className={inputClass}
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className={labelClass}>State</label>
              <select
                value={schoolData.state || ""}
                onChange={(e) => setSchoolData({ ...schoolData, state: (e.target.value as USState) || undefined })}
                className={inputClass}
              >
                <option value="">Select a state</option>
                {USStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>School Type(s)</label>
            <select
              multiple
              value={schoolData.type}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value as SchoolTypeValue);
                setSchoolData({ ...schoolData, type: selected });
              }}
              className={`${inputClass} h-32`}
            >
              {Object.values(SchoolType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create School
          </Button>
        </div>
      </div>
    </div>
  );
}
