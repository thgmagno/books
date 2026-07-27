"use client";

import { useTransition } from "react";
import { updateBookStatus } from "@/app/actions/books";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookStatusOptions } from "@/components/book-status-options";
import type { BookStatus } from "@/lib/types";

export function StatusSelect({
  bookId,
  status,
}: {
  bookId: number;
  status: BookStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(() => updateBookStatus(bookId, value as BookStatus))
      }
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <BookStatusOptions />
      </SelectContent>
    </Select>
  );
}
