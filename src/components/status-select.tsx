"use client";

import { useTransition } from "react";
import { updateBookStatus } from "@/app/actions/books";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOK_STATUS_LABELS, type BookStatus } from "@/lib/types";

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
        {(Object.keys(BOOK_STATUS_LABELS) as BookStatus[]).map((key) => (
          <SelectItem key={key} value={key}>
            {BOOK_STATUS_LABELS[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
