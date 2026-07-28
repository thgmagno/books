"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Plus, Users } from "lucide-react";
import { logout } from "@/app/actions/auth";
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
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
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

        <DropdownMenuSeparator />

        <div className="flex flex-col gap-2 p-2">
          <DropdownMenuItem asChild onClick={() => setOpen(false)}>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/friends">
                <Users className="size-4" />
                Amigos
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild onClick={() => setOpen(false)}>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/books/new">
                <Plus className="size-4" />
                Adicionar livro
              </Link>
            </Button>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm">Tema</span>
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <DropdownMenuItem asChild onSelect={() => logout()}>
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="size-4" />
              Sair
            </Button>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
