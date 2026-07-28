"use client";

import { useTransition } from "react";
import { UserX } from "lucide-react";
import { toast } from "sonner";
import { removeFriendship } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function RemoveFriendButton({
  friendshipId,
  friendName,
}: {
  friendshipId: number;
  friendName: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive shrink-0"
          title="Desfazer amizade"
          aria-label={`Desfazer amizade com ${friendName}`}
        >
          <UserX className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desfazer amizade com {friendName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Você não verá mais os livros e atividades de {friendName}. Dados já
            compartilhados (como clones já feitos) permanecem como estão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() =>
              startTransition(async () => {
                const outcome = await removeFriendship(friendshipId);
                if ("error" in outcome) {
                  toast.error(outcome.error);
                  return;
                }
                toast.success(`Amizade com ${friendName} desfeita`);
              })
            }
          >
            Desfazer amizade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
