"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { cancelFriendRequest, respondFriendRequest } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import type { FriendRequestItem } from "@/lib/types";

export function FriendRequestRow({
  request,
  variant,
}: {
  request: FriendRequestItem;
  variant: "received" | "sent";
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar name={request.name} email={request.email} image={request.image} />
        <div className="min-w-0">
          <p className="truncate font-medium">{request.name ?? request.email}</p>
          <p className="text-muted-foreground truncate font-mono text-xs">{request.email}</p>
        </div>
      </div>

      {variant === "received" ? (
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => respondFriendRequest(request.id, true))}
          >
            <Check className="size-4" />
            Aceitar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => respondFriendRequest(request.id, false))}
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
          onClick={() => startTransition(() => cancelFriendRequest(request.id))}
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}
