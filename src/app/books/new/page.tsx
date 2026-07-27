import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { createBook } from "@/app/actions/books";
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

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Adicionar novo livro
            </CardTitle>
            <CardDescription>
              Comece por aqui. Você pode adicionar anotações depois.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createBook} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Ex: O Senhor dos Anéis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Ex: J.R.R. Tolkien"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Resumo breve do livro (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue="want_to_read"
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="want_to_read">Quer ler</option>
                  <option value="reading">Lendo</option>
                  <option value="read">Lido</option>
                </select>
              </div>

              <Button type="submit" className="w-full">
                Adicionar livro
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
