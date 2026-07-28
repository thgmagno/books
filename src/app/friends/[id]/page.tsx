import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getFriendBooks } from "@/app/actions/clones";
import { CloneBookButton } from "@/components/clone-book-button";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function FriendBooksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const friendUserId = Number(id);
  if (Number.isNaN(friendUserId)) notFound();

  const result = await getFriendBooks(friendUserId);
  if ("error" in result) notFound();

  const { friendName, books } = result;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/friends">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="font-display mb-6 text-2xl font-bold sm:text-3xl">
          Livros de {friendName}
        </h1>

        {books.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              {friendName} ainda não adicionou nenhum livro.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <Card key={book.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold">{book.title}</h3>
                    {book.author && (
                      <p className="text-muted-foreground font-mono text-xs">{book.author}</p>
                    )}
                    {book.description && (
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                        {book.description}
                      </p>
                    )}
                    {book.cloneCount > 0 && (
                      <Badge variant="outline" className="mt-2">
                        {book.cloneCount} {book.cloneCount === 1 ? "clone" : "clones"}
                      </Badge>
                    )}
                  </div>
                  <CloneBookButton bookId={book.id} alreadyCloned={book.alreadyCloned} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
