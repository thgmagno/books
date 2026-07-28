"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus, Users } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { NotificationPanel, useUnreadNotificationCount } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileMenu({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useUnreadNotificationCount();

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Menu">
          <Menu className="size-4" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {open && (
          <NotificationPanel onNavigate={() => setOpen(false)} setUnreadCount={setUnreadCount} />
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild onClick={() => setOpen(false)}>
          <Link href="/friends">
            <Users className="size-4" />
            Amigos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild onClick={() => setOpen(false)}>
          <Link href="/books/new">
            <Plus className="size-4" />
            Adicionar livro
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm">Tema</span>
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="size-8">
            {image && <AvatarImage src={image} alt={name ?? ""} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-muted-foreground truncate font-mono text-xs">{email}</p>
          </div>
        </div>
        <DropdownMenuItem onSelect={() => logout()}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
