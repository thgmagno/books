import Link from "next/link";
import { redirect } from "next/navigation";
import { Library } from "lucide-react";
import { auth } from "@/auth";
import {
  getFriends,
  getPendingReceivedRequests,
  getPendingSentRequests,
} from "@/app/actions/friends";
import { FriendRequestRow } from "@/components/friend-request-row";
import { FriendSearchForm } from "@/components/friend-search-form";
import { Header } from "@/components/header";
import { RemoveFriendButton } from "@/components/remove-friend-button";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [friends, received, sent] = await Promise.all([
    getFriends(),
    getPendingReceivedRequests(),
    getPendingSentRequests(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display mb-6 text-2xl font-bold sm:text-3xl">Amigos</h1>

        <section className="mb-8">
          <FriendSearchForm />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Pedidos recebidos ({received.length})
          </h2>
          {received.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum pedido pendente.</p>
          ) : (
            <div className="space-y-2">
              {received.map((request) => (
                <FriendRequestRow key={request.id} request={request} variant="received" />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Pedidos enviados ({sent.length})
          </h2>
          {sent.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum pedido enviado.</p>
          ) : (
            <div className="space-y-2">
              {sent.map((request) => (
                <FriendRequestRow key={request.id} request={request} variant="sent" />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Meus amigos ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum amigo ainda. Busque por e-mail para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={friend.name} email={friend.email} image={friend.image} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{friend.name ?? friend.email}</p>
                      <p className="text-muted-foreground truncate font-mono text-xs">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button asChild variant="ghost" size="icon" title="Ver livros" aria-label={`Ver livros de ${friend.name ?? friend.email}`}>
                      <Link href={`/friends/${friend.userId}`}>
                        <Library className="size-4" />
                      </Link>
                    </Button>
                    <RemoveFriendButton
                      friendshipId={friend.friendshipId}
                      friendName={friend.name ?? friend.email}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
