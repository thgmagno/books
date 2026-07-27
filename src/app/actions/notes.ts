"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Note } from "@/lib/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }
  return session.user.email;
}

async function assertBookOwnership(bookId: number, email: string) {
  const result = await db.query(
    "SELECT id FROM books WHERE id = $1 AND user_email = $2",
    [bookId, email]
  );
  return result.rows.length > 0;
}

export async function getNotes(bookId: number): Promise<Note[]> {
  const email = await requireUser();
  if (!(await assertBookOwnership(bookId, email))) return [];

  const result = await db.query(
    "SELECT * FROM notes WHERE book_id = $1 ORDER BY created_at DESC",
    [bookId]
  );
  return result.rows;
}

export async function createNote(formData: FormData) {
  const email = await requireUser();
  const bookId = Number(formData.get("book_id"));
  const noteType = String(formData.get("note_type") ?? "general");
  const content = String(formData.get("content") ?? "").trim();
  const pageRaw = String(formData.get("page_number") ?? "").trim();
  const pageNumber = pageRaw ? Number(pageRaw) : null;

  if (!content || !bookId) {
    return { error: "Conteúdo é obrigatório" };
  }
  if (!(await assertBookOwnership(bookId, email))) {
    return { error: "Livro não encontrado" };
  }

  await db.query(
    `INSERT INTO notes (book_id, note_type, content, page_number)
     VALUES ($1, $2, $3, $4)`,
    [bookId, noteType, content, pageNumber]
  );

  revalidatePath(`/books/${bookId}`);
}

export async function deleteNote(noteId: number, bookId: number) {
  const email = await requireUser();
  if (!(await assertBookOwnership(bookId, email))) return;

  await db.query("DELETE FROM notes WHERE id = $1 AND book_id = $2", [
    noteId,
    bookId,
  ]);
  revalidatePath(`/books/${bookId}`);
}
