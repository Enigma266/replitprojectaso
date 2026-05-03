import { cn } from "@/lib/utils";
import { ASSOCIATION_STATUSES, STATUS_COLORS } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800 border-gray-200"
      )}
    >
      {ASSOCIATION_STATUSES[status] ?? status}
    </span>
  );
}
