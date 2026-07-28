export type BookStatus = "want_to_read" | "reading" | "read";
export type NoteType = "summary" | "idea" | "quote" | "general";

export interface Book {
  id: number;
  user_email: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_image_url: string | null;
  status: BookStatus;
  date_started: string | null;
  date_finished: string | null;
  clone_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  book_id: number;
  note_type: NoteType;
  content: string;
  page_number: number | null;
  created_at: string;
  updated_at: string;
}

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: "Quer ler",
  reading: "Lendo",
  read: "Lido",
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  summary: "Resumo",
  idea: "Ideia",
  quote: "Citação",
  general: "Nota",
};

export type FriendStatus = "self" | "friend" | "pending_sent" | "pending_received" | "none";

export interface UserSearchResult {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  status: FriendStatus;
  friendRequestId: number | null;
}

export interface FriendListItem {
  friendshipId: number;
  userId: number;
  name: string | null;
  email: string;
  image: string | null;
}

export interface FriendRequestItem {
  id: number;
  userId: number;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

export type ActionResult = { success: true } | { error: string };

export interface FriendBookItem {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  cloneCount: number;
  alreadyCloned: boolean;
}

export type CloneOrigin = { ownerName: string } | { removed: true } | null;

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  relatedUserId: number | null;
  relatedBookId: number | null;
  relatedFriendRequestId: number | null;
  readAt: string | null;
  createdAt: string;
}
