"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteNote } from "@/app/actions/notes";
import { Button } from "@/components/ui/button";

export function DeleteNoteButton({
  noteId,
  bookId,
}: {
  noteId: number;
  bookId: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive size-7"
      title="Deletar nota"
      onClick={() => {
        if (confirm("Deletar esta anotação?")) {
          startTransition(() => deleteNote(noteId, bookId));
        }
      }}
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
