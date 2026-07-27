"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Book, BookStatus } from "@/lib/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }
  return session.user.email;
}

export async function getBooks(search?: string): Promise<Book[]> {
  const email = await requireUser();
  const params: unknown[] = [email];
  let query = "SELECT * FROM books WHERE user_email = $1";

  if (search) {
    query += " AND (title ILIKE $2 OR author ILIKE $2)";
    params.push(`%${search}%`);
  }

  query += " ORDER BY updated_at DESC";
  const result = await db.query(query, params);
  return result.rows;
}

export async function getBook(id: number): Promise<Book | null> {
  const email = await requireUser();
  const result = await db.query(
    "SELECT * FROM books WHERE id = $1 AND user_email = $2",
    [id, email]
  );
  return result.rows[0] ?? null;
}

export async function createBook(formData: FormData) {
  const email = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "want_to_read");

  if (!title) {
    // O campo é required no form; se chegar vazio, volta ao formulário.
    redirect("/books/new");
  }

  const result = await db.query(
    `INSERT INTO books (user_email, title, author, description, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [email, title, author || null, description || null, status]
  );

  revalidatePath("/");
  redirect(`/books/${result.rows[0].id}`);
}

export async function updateBookStatus(id: number, status: BookStatus) {
  const email = await requireUser();

  const extra =
    status === "reading"
      ? ", date_started = COALESCE(date_started, CURRENT_DATE)"
      : status === "read"
        ? ", date_finished = COALESCE(date_finished, CURRENT_DATE)"
        : "";

  await db.query(
    `UPDATE books SET status = $3, updated_at = NOW()${extra}
     WHERE id = $1 AND user_email = $2`,
    [id, email, status]
  );

  revalidatePath("/");
  revalidatePath(`/books/${id}`);
}

export async function deleteBook(id: number) {
  const email = await requireUser();
  await db.query("DELETE FROM books WHERE id = $1 AND user_email = $2", [
    id,
    email,
  ]);
  revalidatePath("/");
  redirect("/");
}
