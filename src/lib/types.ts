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
