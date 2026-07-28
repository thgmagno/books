import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Garante que o usuário logado tem uma linha em `users` (a tabela não é
 * populada automaticamente pelo NextAuth — não há adapter de DB). Faz
 * upsert por e-mail a cada chamada, então funciona mesmo para sessões que
 * começaram antes dessa tabela existir. Usado por qualquer server action
 * que precise do id numérico do usuário (amigos, clones).
 */
export async function getOrCreateCurrentUser(): Promise<{
  id: number;
  email: string;
  name: string | null;
}> {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }
  const email = session.user.email;
  const name = session.user.name ?? null;
  const result = await db.query(
    `INSERT INTO users (email, name, image) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image
     RETURNING id`,
    [email, name, session.user.image ?? null]
  );
  return { id: result.rows[0].id, email, name };
}
