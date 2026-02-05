"use client";

import { useQuery, useMutation } from "@/lib/apollo-hooks";
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/lib/graphql/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();

  const { data, loading, refetch, fetchMore } = useQuery(GET_NOTIFICATIONS, {
    variables: { page: 0, size: 20 },
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const notifications = data?.notifications?.content || [];
  const hasMore = data?.notifications?.hasNext || false;
  const unreadCount = data?.notifications?.unreadCount || 0;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead({
        variables: { id: notification.id },
      });
      refetch();
    }

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

  const handleLoadMore = async () => {
    if (!hasMore) return;

    await fetchMore({
      variables: {
        page: Math.floor(notifications.length / 20),
        size: 20,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          notifications: {
            ...fetchMoreResult.notifications,
            content: [
              ...prev.notifications.content,
              ...fetchMoreResult.notifications.content,
            ],
          },
        };
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No notifications yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification: any) => (
              <Card
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "cursor-pointer hover:bg-accent transition-colors",
                  !notification.read && "border-l-4 border-l-blue-500"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {!notification.read && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-tight">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notification.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="w-full"
            >
              Load More
            </Button>
          )}
        </>
      )}
    </div>
  );
}
