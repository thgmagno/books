"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookStatusOptions } from "@/components/book-status-options";
import type { BookStatus } from "@/lib/types";

export function NewBookStatusSelect() {
  const [status, setStatus] = useState<BookStatus>("want_to_read");

  return (
    <Select value={status} onValueChange={(value) => setStatus(value as BookStatus)}>
      <input type="hidden" name="status" value={status} />
      <SelectTrigger id="status" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <BookStatusOptions />
      </SelectContent>
    </Select>
  );
}
