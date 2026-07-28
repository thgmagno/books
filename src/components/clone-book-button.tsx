"use client";

import { useTransition } from "react";
import { Check, GitFork } from "lucide-react";
import { toast } from "sonner";
import { cloneBook } from "@/app/actions/clones";
import { Button } from "@/components/ui/button";

export function CloneBookButton({
  bookId,
  alreadyCloned,
}: {
  bookId: number;
  alreadyCloned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (alreadyCloned) {
    return (
      <Button variant="outline" size="sm" disabled className="shrink-0">
        <Check className="size-4" />
        Já clonado
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isPending}
      className="shrink-0"
      onClick={() =>
        startTransition(async () => {
          const outcome = await cloneBook(bookId);
          if (outcome && "error" in outcome) {
            toast.error(outcome.error);
          }
        })
      }
    >
      <GitFork className="size-4" />
      Clonar
    </Button>
  );
}
