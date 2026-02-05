"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@/lib/apollo-hooks";
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/lib/graphql/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { page: 0, size: 10 },
    skip: !open,
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const notifications = data?.notifications?.content || [];
  const unreadCount = data?.notifications?.unreadCount || 0;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead({
        variables: { id: notification.id },
      });
      refetch();
    }

    setOpen(false);

    // Navigate based on notification type
    if (notification.relatedWorkout) {
      router.push(`/workouts/${notification.relatedWorkout.id}`);
    } else if (notification.relatedUser) {
      router.push(`/profile/${notification.relatedUser.username}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "cursor-pointer p-3 focus:bg-accent",
                  !notification.read && "bg-accent/50"
                )}
              >
                <div className="flex gap-3 w-full">
                  {!notification.read && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-tight">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="text-center w-full cursor-pointer"
              >
                See all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
