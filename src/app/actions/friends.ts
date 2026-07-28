"use server";

import { revalidatePath } from "next/cache";
import { db, withTransaction } from "@/lib/db";
import { authorize, areFriends, UnauthorizedError } from "@/lib/authorize";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import type { ActionResult, FriendListItem, FriendRequestItem, UserSearchResult } from "@/lib/types";

function mapRequestRow(row: {
  id: number;
  user_id: number;
  name: string | null;
  email: string;
  image: string | null;
  created_at: string;
}): FriendRequestItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    image: row.image,
    createdAt: row.created_at,
  };
}

export async function searchUserByEmail(
  email: string
): Promise<UserSearchResult | { error: string }> {
  const { id: actorId } = await getOrCreateCurrentUser();
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { error: "Informe um e-mail" };
  }

  const result = await db.query("SELECT id, name, email, image FROM users WHERE LOWER(email) = $1", [
    trimmed,
  ]);
  const target = result.rows[0];
  if (!target) {
    return { error: "Nenhum usuário encontrado com esse e-mail" };
  }

  if (target.id === actorId) {
    return { ...target, status: "self", friendRequestId: null };
  }

  if (await areFriends(actorId, target.id)) {
    return { ...target, status: "friend", friendRequestId: null };
  }

  const pendingResult = await db.query(
    `SELECT id, requester_id FROM friend_requests
     WHERE status = 'pending'
       AND ((requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1))`,
    [actorId, target.id]
  );
  const pending = pendingResult.rows[0];
  if (pending) {
    return {
      ...target,
      status: pending.requester_id === actorId ? "pending_sent" : "pending_received",
      friendRequestId: pending.id,
    };
  }

  return { ...target, status: "none", friendRequestId: null };
}

export async function sendFriendRequest(targetUserId: number): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  try {
    await authorize(actorId, "SEND_FRIEND_REQUEST", { targetUserId });
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "Não foi possível enviar o pedido" };
    throw err;
  }

  await db.query("INSERT INTO friend_requests (requester_id, recipient_id) VALUES ($1, $2)", [
    actorId,
    targetUserId,
  ]);
  revalidatePath("/friends");
  return { success: true };
}

export async function cancelFriendRequest(requestId: number): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  try {
    await authorize(actorId, "CANCEL_FRIEND_REQUEST", { friendRequestId: requestId });
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "Não foi possível cancelar o pedido" };
    throw err;
  }

  await db.query(
    "UPDATE friend_requests SET status = 'cancelled', responded_at = NOW(), updated_at = NOW() WHERE id = $1",
    [requestId]
  );
  revalidatePath("/friends");
  return { success: true };
}

export async function respondFriendRequest(
  requestId: number,
  accept: boolean
): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  try {
    await authorize(actorId, "RESPOND_FRIEND_REQUEST", { friendRequestId: requestId });
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "Não foi possível responder o pedido" };
    throw err;
  }

  await withTransaction(async (client) => {
    const requestResult = await client.query(
      "SELECT requester_id, recipient_id FROM friend_requests WHERE id = $1 FOR UPDATE",
      [requestId]
    );
    const request = requestResult.rows[0];
    if (!request) return;

    if (accept) {
      await client.query(
        "UPDATE friend_requests SET status = 'accepted', responded_at = NOW(), updated_at = NOW() WHERE id = $1",
        [requestId]
      );
      await client.query(
        `INSERT INTO friendships (user_id, friend_id, friend_request_id)
         VALUES ($1, $2, $3), ($2, $1, $3)
         ON CONFLICT (user_id, friend_id) DO UPDATE SET deleted_at = NULL`,
        [request.requester_id, request.recipient_id, requestId]
      );
    } else {
      await client.query(
        "UPDATE friend_requests SET status = 'rejected', responded_at = NOW(), updated_at = NOW() WHERE id = $1",
        [requestId]
      );
    }
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriendship(friendshipId: number): Promise<ActionResult> {
  const { id: actorId } = await getOrCreateCurrentUser();
  try {
    await authorize(actorId, "REMOVE_FRIENDSHIP", { friendshipId });
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: "Não foi possível desfazer a amizade" };
    throw err;
  }

  await withTransaction(async (client) => {
    const friendshipResult = await client.query(
      "SELECT user_id, friend_id FROM friendships WHERE id = $1",
      [friendshipId]
    );
    const friendship = friendshipResult.rows[0];
    if (!friendship) return;

    await client.query(
      `UPDATE friendships SET deleted_at = NOW()
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [friendship.user_id, friendship.friend_id]
    );
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function getFriends(): Promise<FriendListItem[]> {
  const { id: actorId } = await getOrCreateCurrentUser();
  const result = await db.query(
    `SELECT f.id AS friendship_id, u.id AS user_id, u.name, u.email, u.image
     FROM friendships f
     JOIN users u ON u.id = f.friend_id
     WHERE f.user_id = $1 AND f.deleted_at IS NULL
     ORDER BY u.name NULLS LAST, u.email`,
    [actorId]
  );
  return result.rows.map((row) => ({
    friendshipId: row.friendship_id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    image: row.image,
  }));
}

export async function getPendingReceivedRequests(): Promise<FriendRequestItem[]> {
  const { id: actorId } = await getOrCreateCurrentUser();
  const result = await db.query(
    `SELECT fr.id, u.id AS user_id, u.name, u.email, u.image, fr.created_at
     FROM friend_requests fr
     JOIN users u ON u.id = fr.requester_id
     WHERE fr.recipient_id = $1 AND fr.status = 'pending'
     ORDER BY fr.created_at DESC`,
    [actorId]
  );
  return result.rows.map(mapRequestRow);
}

export async function getPendingSentRequests(): Promise<FriendRequestItem[]> {
  const { id: actorId } = await getOrCreateCurrentUser();
  const result = await db.query(
    `SELECT fr.id, u.id AS user_id, u.name, u.email, u.image, fr.created_at
     FROM friend_requests fr
     JOIN users u ON u.id = fr.recipient_id
     WHERE fr.requester_id = $1 AND fr.status = 'pending'
     ORDER BY fr.created_at DESC`,
    [actorId]
  );
  return result.rows.map(mapRequestRow);
}
