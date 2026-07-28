"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import type { ActionResult, NotificationItem } from "@/lib/types";

function mapRow(row: {
  id: number;
  type: string;
  title: string;
  related_user_id: number | null;
  related_book_id: number | null;
  related_friend_request_id: number | null;
  read_at: string | null;
  created_at: string;
}): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    relatedUserId: row.related_user_id,
    relatedBookId: row.related_book_id,
    relatedFriendRequestId: row.related_friend_request_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

const RECENT_LIMIT = 20;

export async function getNotifications(): Promise<NotificationItem[]> {
  const { id: actorId } = await getOrCreateCurrentUser();
  const result = await db.query(
    `SELECT id, type, title, related_user_id, related_book_id, related_friend_request_id,
            read_at, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [actorId, RECENT_LIMIT]
  );
  return result.rows.map(mapRow);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { id: actorId } = await getOrCreateCurrentUser();
  const result = await db.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL",
    [actorId]
  );
  return result.rows[0].count;
}

export async function markNotificationAsRead(notificationId: number): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  await db.query(
    "UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2 AND read_at IS NULL",
    [notificationId, actorId]
  );
  revalidatePath("/");
  return { success: true };
}

export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  await db.query(
    "UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL",
    [actorId]
  );
  revalidatePath("/");
  return { success: true };
}

export async function clearAllNotifications(): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  await db.query("DELETE FROM notifications WHERE user_id = $1", [actorId]);
  revalidatePath("/");
  return { success: true };
}
