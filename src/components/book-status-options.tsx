import { SelectItem } from "@/components/ui/select";
import { BOOK_STATUS_LABELS, type BookStatus } from "@/lib/types";

export function BookStatusOptions() {
  return (
    <>
      {(Object.keys(BOOK_STATUS_LABELS) as BookStatus[]).map((key) => (
        <SelectItem key={key} value={key}>
          {BOOK_STATUS_LABELS[key]}
        </SelectItem>
      ))}
    </>
  );
}
