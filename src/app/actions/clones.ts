"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, withTransaction } from "@/lib/db";
import { authorize, UnauthorizedError } from "@/lib/authorize";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import type { CloneOrigin, FriendBookItem } from "@/lib/types";

export async function getFriendBooks(
  friendUserId: number
): Promise<{ friendName: string; books: FriendBookItem[] } | { error: string }> {
  const { id: actorId } = await getOrCreateCurrentUser();

  try {
    await authorize(actorId, "VIEW_PROFILE", { targetUserId: friendUserId });
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "Perfil não disponível" };
    throw err;
  }

  const friendResult = await db.query("SELECT email, name FROM users WHERE id = $1", [
    friendUserId,
  ]);
  const friend = friendResult.rows[0];
  if (!friend) return { error: "Usuário não encontrado" };

  const booksResult = await db.query(
    `SELECT b.id, b.title, b.author, b.description, b.clone_count,
            EXISTS (
              SELECT 1 FROM book_clones bc
              WHERE bc.cloned_from_book_id = b.id AND bc.cloned_by_user_id = $2
            ) AS already_cloned
     FROM books b
     WHERE b.user_email = $1
     ORDER BY b.updated_at DESC`,
    [friend.email, actorId]
  );

  return {
    friendName: friend.name ?? friend.email,
    books: booksResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description,
      cloneCount: row.clone_count,
      alreadyCloned: row.already_cloned,
    })),
  };
}

export async function cloneBook(bookId: number): Promise<{ error: string } | undefined> {
  const { id: actorId, email: actorEmail } = await getOrCreateCurrentUser();

  try {
    await authorize(actorId, "CLONE_BOOK", { bookId });
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "Você não pode clonar este livro" };
    throw err;
  }

  const existing = await db.query(
    "SELECT 1 FROM book_clones WHERE cloned_from_book_id = $1 AND cloned_by_user_id = $2",
    [bookId, actorId]
  );
  if ((existing.rowCount ?? 0) > 0) {
    return { error: "Você já clonou este livro" };
  }

  const sourceResult = await db.query(
    "SELECT title, author, description FROM books WHERE id = $1",
    [bookId]
  );
  const source = sourceResult.rows[0];
  if (!source) return { error: "Livro não encontrado" };

  // Se o livro sendo clonado já é, ele próprio, um clone, a raiz da cadeia é
  // a dele; caso contrário, ele mesmo é a raiz.
  const chainResult = await db.query("SELECT original_book_id FROM book_clones WHERE book_id = $1", [
    bookId,
  ]);
  const originalBookId = chainResult.rows[0]?.original_book_id ?? bookId;

  let newBookId: number | undefined;
  await withTransaction(async (client) => {
    const newBookResult = await client.query(
      `INSERT INTO books (user_email, title, author, description, status)
       VALUES ($1, $2, $3, $4, 'want_to_read')
       RETURNING id`,
      [actorEmail, source.title, source.author, source.description]
    );
    newBookId = newBookResult.rows[0].id;

    await client.query(
      `INSERT INTO book_clones (book_id, cloned_from_book_id, original_book_id, cloned_by_user_id)
       VALUES ($1, $2, $3, $4)`,
      [newBookId, bookId, originalBookId, actorId]
    );

    await client.query("UPDATE books SET clone_count = clone_count + 1 WHERE id = $1", [bookId]);
  });

  revalidatePath("/");
  redirect(`/books/${newBookId}`);
}

/** Para exibir "Clonado da biblioteca de X" na página de detalhe do livro. */
export async function getCloneOrigin(bookId: number): Promise<CloneOrigin> {
  const result = await db.query(
    `SELECT bc.cloned_from_book_id, u.name, u.email
     FROM book_clones bc
     LEFT JOIN books b ON b.id = bc.cloned_from_book_id
     LEFT JOIN users u ON u.email = b.user_email
     WHERE bc.book_id = $1`,
    [bookId]
  );
  const row = result.rows[0];
  if (!row) return null;
  if (!row.cloned_from_book_id) return { removed: true };
  return { ownerName: row.name ?? row.email };
}
