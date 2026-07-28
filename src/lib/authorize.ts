import { db } from "@/lib/db";

/**
 * Lançada por authorize() quando a ação não é permitida. Quem chama decide
 * como tratar: recomenda-se converter em 404 (não 403) para não confirmar a
 * existência de um recurso a quem não tem acesso a ele — ver
 * docs/PERMISSIONS.md secao 3.
 */
export class UnauthorizedError extends Error {
  constructor(message = "Não autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type Action =
  | "VIEW_PROFILE"
  | "VIEW_FRIEND_LIST"
  | "SEND_FRIEND_REQUEST"
  | "CANCEL_FRIEND_REQUEST"
  | "RESPOND_FRIEND_REQUEST"
  | "REMOVE_FRIENDSHIP"
  | "VIEW_BOOK"
  | "EDIT_BOOK"
  | "DELETE_BOOK"
  | "CLONE_BOOK"
  | "LIKE_BOOK"
  | "COMMENT_BOOK";

interface AuthorizeContext {
  targetUserId?: number;
  bookId?: number;
  friendRequestId?: number;
  friendshipId?: number;
}

/** Amizade ativa (aceita e não desfeita) entre dois usuários, em qualquer ordem. */
export async function areFriends(userId: number, otherUserId: number): Promise<boolean> {
  if (userId === otherUserId) return false;
  const result = await db.query(
    "SELECT 1 FROM friendships WHERE user_id = $1 AND friend_id = $2 AND deleted_at IS NULL",
    [userId, otherUserId]
  );
  return (result.rowCount ?? 0) > 0;
}

/** ID em `users` do dono de um livro, via join com books.user_email. Null se não existir. */
export async function getBookOwnerId(bookId: number): Promise<number | null> {
  const result = await db.query(
    `SELECT u.id FROM books b
     JOIN users u ON u.email = b.user_email
     WHERE b.id = $1`,
    [bookId]
  );
  return result.rows[0]?.id ?? null;
}

/** Existe pedido pendente entre os dois usuários, em qualquer direção. */
async function hasPendingRequestBetween(userIdA: number, userIdB: number): Promise<boolean> {
  const result = await db.query(
    `SELECT 1 FROM friend_requests
     WHERE status = 'pending'
       AND ((requester_id = $1 AND recipient_id = $2)
         OR (requester_id = $2 AND recipient_id = $1))`,
    [userIdA, userIdB]
  );
  return (result.rowCount ?? 0) > 0;
}

async function canViewBook(actorId: number, bookId: number): Promise<boolean> {
  const ownerId = await getBookOwnerId(bookId);
  if (ownerId === null) return false;
  if (actorId === ownerId) return true;
  return areFriends(actorId, ownerId);
}

/**
 * Verifica se `actorId` pode executar `action`. Lança UnauthorizedError se
 * não puder; não retorna nada em caso de sucesso. Ver docs/PERMISSIONS.md
 * para a matriz completa e a justificativa de cada regra.
 */
export async function authorize(
  actorId: number,
  action: Action,
  context: AuthorizeContext = {}
): Promise<void> {
  switch (action) {
    case "VIEW_PROFILE": {
      const { targetUserId } = context;
      if (targetUserId === undefined) throw new UnauthorizedError();
      if (actorId === targetUserId || (await areFriends(actorId, targetUserId))) return;
      throw new UnauthorizedError();
    }

    case "VIEW_FRIEND_LIST": {
      const { targetUserId } = context;
      if (targetUserId === actorId) return;
      throw new UnauthorizedError();
    }

    case "SEND_FRIEND_REQUEST": {
      const { targetUserId } = context;
      if (targetUserId === undefined || targetUserId === actorId) throw new UnauthorizedError();
      if (await areFriends(actorId, targetUserId)) throw new UnauthorizedError();
      if (await hasPendingRequestBetween(actorId, targetUserId)) throw new UnauthorizedError();
      return;
    }

    case "CANCEL_FRIEND_REQUEST": {
      const { friendRequestId } = context;
      if (friendRequestId === undefined) throw new UnauthorizedError();
      const result = await db.query(
        "SELECT 1 FROM friend_requests WHERE id = $1 AND requester_id = $2 AND status = 'pending'",
        [friendRequestId, actorId]
      );
      if ((result.rowCount ?? 0) > 0) return;
      throw new UnauthorizedError();
    }

    case "RESPOND_FRIEND_REQUEST": {
      const { friendRequestId } = context;
      if (friendRequestId === undefined) throw new UnauthorizedError();
      const result = await db.query(
        "SELECT 1 FROM friend_requests WHERE id = $1 AND recipient_id = $2 AND status = 'pending'",
        [friendRequestId, actorId]
      );
      if ((result.rowCount ?? 0) > 0) return;
      throw new UnauthorizedError();
    }

    case "REMOVE_FRIENDSHIP": {
      const { friendshipId } = context;
      if (friendshipId === undefined) throw new UnauthorizedError();
      const result = await db.query(
        `SELECT 1 FROM friendships
         WHERE id = $1 AND deleted_at IS NULL AND (user_id = $2 OR friend_id = $2)`,
        [friendshipId, actorId]
      );
      if ((result.rowCount ?? 0) > 0) return;
      throw new UnauthorizedError();
    }

    case "VIEW_BOOK":
    case "LIKE_BOOK":
    case "COMMENT_BOOK": {
      const { bookId } = context;
      if (bookId === undefined) throw new UnauthorizedError();
      if (await canViewBook(actorId, bookId)) return;
      throw new UnauthorizedError();
    }

    case "EDIT_BOOK":
    case "DELETE_BOOK": {
      const { bookId } = context;
      if (bookId === undefined) throw new UnauthorizedError();
      const ownerId = await getBookOwnerId(bookId);
      if (ownerId !== null && ownerId === actorId) return;
      throw new UnauthorizedError();
    }

    case "CLONE_BOOK": {
      const { bookId } = context;
      if (bookId === undefined) throw new UnauthorizedError();
      const ownerId = await getBookOwnerId(bookId);
      if (ownerId === null || ownerId === actorId) throw new UnauthorizedError();
      if (await areFriends(actorId, ownerId)) return;
      throw new UnauthorizedError();
    }
  }
}
