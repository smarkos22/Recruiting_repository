import { PersonFull } from "../types/database";
import { Star, MapPin, GripVertical } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useRef, useEffect } from "react";

interface RecruitTableProps {
  recruits: PersonFull[];
  onDelete: (id: string) => void;
  onSelect?: (recruit: PersonFull) => void;
}

interface ColumnConfig {
  id: string;
  label: string;
  width: number;
  minWidth: number;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "name", label: "Name", width: 200, minWidth: 150 },
  { id: "role", label: "Role", width: 100, minWidth: 80 },
  { id: "school", label: "School", width: 180, minWidth: 120 },
  { id: "location", label: "Location", width: 150, minWidth: 100 },
  { id: "position", label: "Position", width: 120, minWidth: 80 },
  { id: "class", label: "Class", width: 80, minWidth: 60 },
  { id: "rating", label: "Rating", width: 120, minWidth: 100 },
  { id: "nil", label: "NIL", width: 100, minWidth: 80 },
  { id: "links", label: "Links", width: 100, minWidth: 80 },
  { id: "actions", label: "Actions", width: 120, minWidth: 100 },
];

export function RecruitTable({
  recruits,
  onDelete,
  onSelect,
}: RecruitTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);

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

  // Handle column resizing
  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;
    const column = columns.find(c => c.id === columnId);
    if (column) {
      resizeStartWidth.current = column.width;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const deltaX = e.clientX - resizeStartX.current;
        const newWidth = Math.max(
          columns.find(c => c.id === resizingColumn)?.minWidth || 80,
          resizeStartWidth.current + deltaX
        );
        setColumns(prev => prev.map(col =>
          col.id === resizingColumn ? { ...col, width: newWidth } : col
        ));
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, columns]);

  // Handle column reordering
  const handleDragStart = (columnId: string, e: React.DragEvent) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (columnId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDrop = (targetColumnId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumnId) {
      const draggedIndex = columns.findIndex(c => c.id === draggedColumn);
      const targetIndex = columns.findIndex(c => c.id === targetColumnId);

      const newColumns = [...columns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);

      setColumns(newColumns);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
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

  const renderCell = (columnId: string, person: PersonFull) => {
    const fullName = `${person.first_name} ${person.last_name}`;
    const schoolName = person.school?.name;
    const location = [person.school?.city, person.school?.state].filter(Boolean).join(", ");
    const position = person.type === "player" ? person.player.position.join(", ") : "—";
    const gradYear = person.type === "player" ? person.player.grad_year : undefined;
    const maxpreps = person.type === "player" ? person.rating?.maxpreps : undefined;

    const institutionalTotal = person.type === "player" && person.institutional_allocations
      ? person.institutional_allocations.reduce((sum, a) => sum + (a.annual_amount || 0), 0)
      : 0;
    const externalTotal = person.type === "player" && person.external_nil_deals
      ? person.external_nil_deals.reduce((sum, d) => sum + (d.estimated_amount || 0), 0)
      : 0;
    const totalNIL = institutionalTotal + externalTotal;

    switch (columnId) {
      case "name":
        return <div className="font-medium">{fullName}</div>;
      case "role":
        return (
          <span className="rounded-md border border-[var(--border)] bg-[var(--input-background)] px-2 py-1 text-xs uppercase tracking-wide text-[var(--ink)]">
            {person.type}
          </span>
        );
      case "school":
        return <p>{schoolName || "—"}</p>;
      case "location":
        return location ? (
          <div className="flex items-center gap-1">
            <MapPin className="size-3" />
            {location}
          </div>
        ) : "—";
      case "position":
        return position;
      case "class":
        return gradYear || "—";
      case "rating":
        return maxpreps ? renderStars(maxpreps) : <span className="text-[var(--ink-muted)]">N/A</span>;
      case "nil":
        return totalNIL > 0 ? (
          <div className="text-sm">
            <div className="font-medium">${(totalNIL / 1000).toFixed(0)}K</div>
            <div className="text-xs text-[var(--ink-muted)]">
              {institutionalTotal > 0 && `${(institutionalTotal / 1000).toFixed(0)}K inst.`}
              {institutionalTotal > 0 && externalTotal > 0 && ' + '}
              {externalTotal > 0 && `${(externalTotal / 1000).toFixed(0)}K ext.`}
            </div>
          </div>
        ) : <span className="text-[var(--ink-muted)]">—</span>;
      case "links":
        return (
          <div className="flex flex-col gap-1 text-xs text-[var(--primary)]">
            {person.twitter_url && (
              <a href={person.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                Twitter
              </a>
            )}
            {person.instagram_url && (
              <a href={person.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                Instagram
              </a>
            )}
            {person.linkedin_url && (
              <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                LinkedIn
              </a>
            )}
          </div>
        );
      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(person.record_id);
              }}
            >
              Remove
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-[var(--muted)] text-left text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(column.id, e)}
                  onDragOver={(e) => handleDragOver(column.id, e)}
                  onDrop={(e) => handleDrop(column.id, e)}
                  onDragEnd={handleDragEnd}
                  className={`px-4 py-3 relative select-none ${
                    dragOverColumn === column.id ? 'bg-[var(--primary)]/20' : ''
                  } ${draggedColumn === column.id ? 'opacity-50' : ''}`}
                  style={{ width: `${column.width}px` }}
                >
                  <div className="flex items-center gap-2 cursor-move">
                    <GripVertical className="size-3 opacity-50" />
                    <span>{column.label}</span>
                  </div>
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--primary)] transition-colors"
                    onMouseDown={(e) => handleResizeStart(column.id, e)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {recruits.map((person) => (
              <tr
                key={person.record_id}
                className={`align-top ${onSelect ? "cursor-pointer hover:bg-[var(--muted)]/40" : ""}`}
                onClick={() => onSelect?.(person)}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className="px-4 py-3 text-[var(--ink)]"
                    style={{ width: `${column.width}px` }}
                  >
                    {renderCell(column.id, person)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
