import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getBook, updateBook } from "@/app/actions/books";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const bookId = Number(id);
  if (Number.isNaN(bookId)) notFound();

  const book = await getBook(bookId);
  if (!book) notFound();

  const updateBookWithId = updateBook.bind(null, book.id);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href={`/books/${book.id}`}>
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Editar livro</CardTitle>
            <CardDescription>Atualize as informações do livro.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateBookWithId} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={book.title}
                  placeholder="Ex: O Senhor dos Anéis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  name="author"
                  defaultValue={book.author ?? ""}
                  placeholder="Ex: J.R.R. Tolkien"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={book.description ?? ""}
                  placeholder="Resumo breve do livro (opcional)"
                />
              </div>

              <Button type="submit" className="w-full">
                Salvar alterações
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
