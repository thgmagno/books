import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-display text-xl font-bold">Book Notes</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link href="/books/new">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Adicionar livro</span>
            </Link>
          </Button>
          <UserMenu
            name={session?.user?.name}
            email={session?.user?.email}
            image={session?.user?.image}
          />
        </div>
      </div>
    </header>
  );
}
