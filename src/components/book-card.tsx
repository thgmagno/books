import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BOOK_STATUS_LABELS, type Book } from "@/lib/types";

const statusVariant: Record<Book["status"], "outline" | "secondary" | "default"> = {
  want_to_read: "outline",
  reading: "secondary",
  read: "default",
};

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="group relative block">
      {/* Marcador de página — assinatura visual */}
      <span
        aria-hidden
        className="page-marker absolute -top-1 right-6 z-10 h-10 w-1.5 rounded-b-full bg-gradient-to-b from-secondary to-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Card className="h-full gap-4 py-4 transition-shadow group-hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-2 px-4">
          <div className="flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-muted-foreground text-3xl">
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <span>📕</span>
            )}
          </div>

          <h3 className="font-display line-clamp-2 font-bold leading-snug">
            {book.title}
          </h3>

          {book.author && (
            <p className="text-muted-foreground line-clamp-1 font-mono text-xs">
              {book.author}
            </p>
          )}

          <div className="mt-auto pt-2">
            <Badge variant={statusVariant[book.status]}>
              {BOOK_STATUS_LABELS[book.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
