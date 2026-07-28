"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cancelFriendRequest, searchUserByEmail, sendFriendRequest } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import type { UserSearchResult } from "@/lib/types";

export function FriendSearchForm() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<UserSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isActing, startAction] = useTransition();

  function handleSearch(formData: FormData) {
    const value = String(formData.get("email") ?? "");
    setError(null);
    setResult(null);
    startSearch(async () => {
      const outcome = await searchUserByEmail(value);
      if ("error" in outcome) {
        setError(outcome.error);
      } else {
        setResult(outcome);
      }
    });
  }

  function handleSendRequest(targetUserId: number) {
    startAction(async () => {
      const outcome = await sendFriendRequest(targetUserId);
      if ("error" in outcome) {
        toast.error(outcome.error);
        return;
      }
      toast.success("Pedido de amizade enviado");
      setResult((prev) => (prev ? { ...prev, status: "pending_sent" } : prev));
    });
  }

  function handleCancelRequest(requestId: number) {
    startAction(async () => {
      const outcome = await cancelFriendRequest(requestId);
      if ("error" in outcome) {
        toast.error(outcome.error);
        return;
      }
      toast.success("Pedido cancelado");
      setResult((prev) => (prev ? { ...prev, status: "none", friendRequestId: null } : prev));
    });
  }

  return (
    <div className="space-y-3">
      <form action={handleSearch} className="flex gap-2">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Buscar usuário por e-mail..."
          required
        />
        <Button type="submit" disabled={isSearching} aria-label="Buscar">
          {isSearching ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </form>

      {error && <p className="text-muted-foreground text-sm">{error}</p>}

      {result && (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={result.name} email={result.email} image={result.image} />
            <div className="min-w-0">
              <p className="truncate font-medium">{result.name ?? result.email}</p>
              <p className="text-muted-foreground truncate font-mono text-xs">{result.email}</p>
            </div>
          </div>

          {result.status === "self" && (
            <span className="text-muted-foreground shrink-0 text-sm">Você</span>
          )}
          {result.status === "friend" && (
            <span className="text-muted-foreground shrink-0 text-sm">Já são amigos</span>
          )}
          {result.status === "pending_received" && (
            <span className="text-muted-foreground shrink-0 text-sm">Pedido recebido</span>
          )}
          {result.status === "pending_sent" && result.friendRequestId && (
            <Button
              variant="outline"
              size="sm"
              disabled={isActing}
              className="shrink-0"
              onClick={() => handleCancelRequest(result.friendRequestId!)}
            >
              Cancelar pedido
            </Button>
          )}
          {result.status === "none" && (
            <Button
              size="sm"
              disabled={isActing}
              className="shrink-0"
              onClick={() => handleSendRequest(result.id)}
            >
              <UserPlus className="size-4" />
              Enviar pedido
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
