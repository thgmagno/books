"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  clearAllNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000;

function relativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays}d`;
}

function notificationHref(notification: NotificationItem): string {
  switch (notification.type) {
    case "FRIEND_REQUEST_RECEIVED":
      return "/friends";
    case "FRIEND_REQUEST_ACCEPTED":
      return notification.relatedUserId ? `/friends/${notification.relatedUserId}` : "/friends";
    case "BOOK_CLONED":
      return notification.relatedBookId ? `/books/${notification.relatedBookId}` : "/";
    default:
      return "/";
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function refreshUnreadCount() {
      const count = await getUnreadNotificationCount();
      if (!cancelled) setUnreadCount(count);
    }
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      startTransition(async () => {
        setNotifications(await getNotifications());
      });
    }
  }

  function handleItemClick(notification: NotificationItem) {
    setOpen(false);
    if (!notification.readAt) {
      setUnreadCount((count) => Math.max(0, count - 1));
      startTransition(async () => {
        await markNotificationAsRead(notification.id);
      });
    }
    router.push(notificationHref(notification));
  }

  function handleMarkAllRead() {
    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    );
    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  }

  function handleClearAll() {
    setNotifications([]);
    setUnreadCount(0);
    startTransition(async () => {
      await clearAllNotifications();
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notificações"
          aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : "Notificações"}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="text-sm font-medium">Notificações</span>
          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-xs"
                onClick={handleMarkAllRead}
              >
                Marcar lidas
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive text-xs"
                onClick={handleClearAll}
              >
                Limpar
              </button>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground px-2 py-4 text-center text-sm">
              {isLoading ? "Carregando..." : "Nenhuma notificação"}
            </p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleItemClick(notification)}
                className={cn(
                  "hover:bg-accent flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-2 text-left text-sm",
                  !notification.readAt && "bg-accent/50"
                )}
              >
                <span>{notification.title}</span>
                <span className="text-muted-foreground text-xs">
                  {relativeTime(notification.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
