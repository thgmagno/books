"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOK_STATUS_LABELS, type BookStatus } from "@/lib/types";

export function NewBookStatusSelect() {
  const [status, setStatus] = useState<BookStatus>("want_to_read");

  return (
    <Select value={status} onValueChange={(value) => setStatus(value as BookStatus)}>
      <input type="hidden" name="status" value={status} />
      <SelectTrigger id="status" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(BOOK_STATUS_LABELS) as BookStatus[]).map((key) => (
          <SelectItem key={key} value={key}>
            {BOOK_STATUS_LABELS[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
