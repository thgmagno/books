"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBook } from "@/app/actions/books";
import { Button } from "@/components/ui/button";

export function DeleteBookButton({ bookId }: { bookId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      title="Deletar livro"
      onClick={() => {
        if (confirm("Deletar este livro e todas as anotações? Esta ação não pode ser desfeita.")) {
          startTransition(() => deleteBook(bookId));
        }
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
