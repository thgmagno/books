import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { getBooks } from "@/app/actions/books";
import { BookCard } from "@/components/book-card";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { BOOK_STATUS_LABELS, type Book, type BookStatus } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { q } = await searchParams;
  const books = await getBooks(q);

  const grouped: Record<BookStatus, Book[]> = {
    reading: books.filter((b) => b.status === "reading"),
    want_to_read: books.filter((b) => b.status === "want_to_read"),
    read: books.filter((b) => b.status === "read"),
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Minha Biblioteca
          </h1>
          <p className="text-muted-foreground mt-1">
            {books.length} {books.length === 1 ? "livro registrado" : "livros registrados"}
          </p>
        </div>

        <form className="relative mb-10 max-w-md" action="/">
          <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título ou autor..."
            className="pl-9"
          />
        </form>

        {books.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="mb-1 text-lg font-medium">
              {q ? "Nenhum livro encontrado" : "Sua biblioteca está vazia"}
            </p>
            <p className="text-muted-foreground">
              {q
                ? "Tente buscar por outro termo."
                : "Adicione seu primeiro livro para começar."}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {(Object.keys(grouped) as BookStatus[]).map(
              (status) =>
                grouped[status].length > 0 && (
                  <section key={status}>
                    <h2 className="font-display mb-5 text-2xl font-bold">
                      {BOOK_STATUS_LABELS[status]}
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {grouped[status].map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  </section>
                )
            )}
          </div>
        )}
      </main>
    </>
  );
}
