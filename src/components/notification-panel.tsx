"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  clearAllNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/notifications";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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

/** Poll leve do contador de não lidas, usado pelo sino (desktop) e pelo badge do menu hambúrguer (mobile). */
export function useUnreadNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const count = await getUnreadNotificationCount();
      if (!cancelled) setUnreadCount(count);
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [unreadCount, setUnreadCount] as const;
}

/**
 * Conteúdo da lista de notificações (sem trigger próprio) — usado dentro do
 * DropdownMenuContent do sino no desktop e embutido direto no menu
 * hambúrguer no mobile, sem precisar de um segundo dropdown aninhado.
 */
export function NotificationPanel({
  onNavigate,
  setUnreadCount,
}: {
  onNavigate: () => void;
  setUnreadCount: (updater: (count: number) => number) => void;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setNotifications(await getNotifications());
    });
  }, []);

  function handleItemClick(notification: NotificationItem) {
    onNavigate();
    if (!notification.readAt) {
      setUnreadCount((count) => Math.max(0, count - 1));
      startTransition(async () => {
        await markNotificationAsRead(notification.id);
      });
    }
    router.push(notificationHref(notification));
  }

  function handleMarkAllRead() {
    setUnreadCount(() => 0);
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    );
    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  }

  function handleClearAll() {
    setNotifications([]);
    setUnreadCount(() => 0);
    startTransition(async () => {
      await clearAllNotifications();
    });
  }

  return (
    <>
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
      <div className="max-h-72 overflow-y-auto">
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
    </>
  );
}
