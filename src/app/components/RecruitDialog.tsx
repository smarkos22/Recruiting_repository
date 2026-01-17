import { PersonFull, School, PersonTypeValue } from "../types/database";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { useState } from "react";

interface RecruitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  recruit?: PersonFull;
  mode: "add" | "edit";
  schools: School[];
}

export function RecruitDialog({ isOpen, onClose, onSave, schools }: RecruitDialogProps) {
  const [selectedType, setSelectedType] = useState<PersonTypeValue | null>(null);

  if (!isOpen) return null;

  const handleTypeSelect = () => {
    if (selectedType) {
      // Create a new person with the selected type
      onSave({ type: selectedType });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[var(--ink)]">
            Add Person
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-[var(--ink-muted)] hover:bg-[var(--muted)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
              What type of person would you like to add?
            </label>
            <select
              value={selectedType || "player"}
              onChange={(e) => setSelectedType(e.target.value as PersonTypeValue)}
              className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[var(--ink)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="player">Player</option>
              <option value="coach">Coach</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleTypeSelect}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
