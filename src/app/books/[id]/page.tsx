import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { getBook } from "@/app/actions/books";
import { getNotes } from "@/app/actions/notes";
import { DeleteNoteButton } from "@/components/delete-note-button";
import { Header } from "@/components/header";
import { NoteForm } from "@/components/note-form";
import { StatusSelect } from "@/components/status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOTE_TYPE_LABELS, type Note, type NoteType } from "@/lib/types";

function NoteItem({ note, bookId }: { note: Note; bookId: number }) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Badge variant="secondary">{NOTE_TYPE_LABELS[note.note_type]}</Badge>
          <DeleteNoteButton noteId={note.id} bookId={bookId} />
        </div>
        <p className="whitespace-pre-wrap">{note.content}</p>
        <p className="text-muted-foreground mt-3 font-mono text-xs">
          {new Date(note.created_at).toLocaleDateString("pt-BR")}
          {note.page_number ? ` • Página ${note.page_number}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

function NoteList({ notes, bookId }: { notes: Note[]; bookId: number }) {
  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Nenhuma anotação deste tipo ainda.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} bookId={bookId} />
      ))}
    </div>
  );
}

export default async function BookDetailPage({
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

  const notes = await getNotes(bookId);
  const noteTypes = Object.keys(NOTE_TYPE_LABELS) as NoteType[];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>

        {/* Cabeçalho do livro */}
        <Card className="mb-8">
          <CardContent className="flex flex-col gap-6 sm:flex-row">
            <div className="flex h-44 w-full sm:w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-muted-foreground text-4xl">
              {book.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.cover_image_url}
                  alt=""
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <span>📕</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center sm:items-start justify-between gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {book.title}
                </h1>
                <Button asChild variant="secondary" size="icon" className="shrink-0" title="Editar livro">
                  <Link href={`/books/${book.id}/edit`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              </div>

              {book.author && (
                <p className="text-muted-foreground mt-1 font-mono text-sm">
                  {book.author}
                </p>
              )}

              {book.description && (
                <p className="mt-4 leading-relaxed">{book.description}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <StatusSelect bookId={book.id} status={book.status} />
                {book.date_started && (
                  <span className="text-muted-foreground font-mono text-xs">
                    Iniciado:{" "}
                    {new Date(book.date_started).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {book.date_finished && (
                  <span className="text-muted-foreground font-mono text-xs">
                    Finalizado:{" "}
                    {new Date(book.date_finished).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de nova anotação */}
        <div className="mb-8">
          <NoteForm bookId={book.id} />
        </div>

        {/* Abas de anotações */}
        <Tabs defaultValue="all">
          <TabsList className="w-full overflow-x-auto sm:w-fit">
            <TabsTrigger value="all">Todas ({notes.length})</TabsTrigger>
            {noteTypes.map((type) => {
              const count = notes.filter((n) => n.note_type === type).length;
              return (
                <TabsTrigger key={type} value={type}>
                  {NOTE_TYPE_LABELS[type]}
                  {count > 0 ? ` (${count})` : ""}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <NoteList notes={notes} bookId={book.id} />
          </TabsContent>
          {noteTypes.map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <NoteList
                notes={notes.filter((n) => n.note_type === type)}
                bookId={book.id}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}
