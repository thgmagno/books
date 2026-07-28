"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { cancelFriendRequest, respondFriendRequest } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import type { ActionResult, FriendRequestItem } from "@/lib/types";

function handleResult(outcome: ActionResult, successMessage: string) {
  if ("error" in outcome) {
    toast.error(outcome.error);
    return;
  }
  toast.success(successMessage);
}

export function FriendRequestRow({
  request,
  variant,
}: {
  request: FriendRequestItem;
  variant: "received" | "sent";
}) {
  const [isPending, startTransition] = useTransition();
  const displayName = request.name ?? request.email;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar name={request.name} email={request.email} image={request.image} />
        <div className="min-w-0">
          <p className="truncate font-medium">{displayName}</p>
          <p className="text-muted-foreground truncate font-mono text-xs">{request.email}</p>
        </div>
      </div>

      {variant === "received" ? (
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            disabled={isPending}
            aria-label={`Aceitar pedido de ${displayName}`}
            onClick={() =>
              startTransition(async () => {
                const outcome = await respondFriendRequest(request.id, true);
                handleResult(outcome, `Agora você é amigo de ${displayName}`);
              })
            }
          >
            <Check className="size-4" />
            Aceitar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            aria-label={`Recusar pedido de ${displayName}`}
            onClick={() =>
              startTransition(async () => {
                const outcome = await respondFriendRequest(request.id, false);
                handleResult(outcome, "Pedido recusado");
              })
            }
          >
            <X className="size-4" />
            Recusar
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="shrink-0"
          aria-label={`Cancelar pedido enviado para ${displayName}`}
          onClick={() =>
            startTransition(async () => {
              const outcome = await cancelFriendRequest(request.id);
              handleResult(outcome, "Pedido cancelado");
            })
          }
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}
