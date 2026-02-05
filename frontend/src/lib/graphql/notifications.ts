import { gql } from "@/lib/apollo-hooks";

// Query to get user notifications
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($page: Int, $size: Int) {
    notifications(page: $page, size: $size) {
      content {
        id
        type
        message
        read
        createdAt
        relatedUser {
          id
          username
          displayName
          avatarUrl
        }
        relatedWorkout {
          id
          title
        }
      }
      totalPages
      totalElements
      unreadCount
    }
  }
`;

// Mutation to mark notification as read
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

// Mutation to mark all notifications as read
export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;
