import { db } from "@/lib/db";

/**
 * Tipos hoje disparados pela aplicação. BOOK_LIKED e BOOK_COMMENTED estão
 * previstos no schema (Issue #12: book_likes/book_comments), mas não há
 * feature de curtir/comentar implementada ainda — nenhuma issue do épico
 * cobre construir essa UI, só a tabela e a intenção de notificar quando
 * ela existir. Ficam de fora daqui até esse dia.
 */
export type NotificationType = "FRIEND_REQUEST_RECEIVED" | "FRIEND_REQUEST_ACCEPTED" | "BOOK_CLONED";

interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  relatedUserId?: number;
  relatedBookId?: number;
  relatedFriendRequestId?: number;
}

/**
 * Registra uma notificação para `userId`. `title` já vem pronto (texto
 * final, não um template) — a UI nunca recalcula a partir das FKs, então
 * elas podem virar NULL (usuário/livro/pedido removido) sem quebrar a
 * notificação já existente.
 */
export async function createNotification({
  userId,
  type,
  title,
  relatedUserId,
  relatedBookId,
  relatedFriendRequestId,
}: CreateNotificationInput): Promise<void> {
  await db.query(
    `INSERT INTO notifications
       (user_id, type, title, related_user_id, related_book_id, related_friend_request_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, title, relatedUserId ?? null, relatedBookId ?? null, relatedFriendRequestId ?? null]
  );
}
