import { gql } from "@/lib/apollo-hooks";

// Query to get user profile by username
export const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    userByUsername(username: $username) {
      id
      username
      email
      displayName
      bio
      avatarUrl
      followersCount
      followingCount
      isFollowing
      createdAt
    }
  }
`;

// Query to get user's followers
export const GET_FOLLOWERS = gql`
  query GetFollowers($userId: ID!, $page: Int, $size: Int) {
    followers(userId: $userId, page: $page, size: $size) {
      content {
        id
        username
        displayName
        avatarUrl
        isFollowing
      }
      totalPages
      totalElements
    }
  }
`;

// Query to get users the user is following
export const GET_FOLLOWING = gql`
  query GetFollowing($userId: ID!, $page: Int, $size: Int) {
    following(userId: $userId, page: $page, size: $size) {
      content {
        id
        username
        displayName
        avatarUrl
        isFollowing
      }
      totalPages
      totalElements
    }
  }
`;

// Mutation to follow a user
export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    follow(userId: $userId)
  }
`;

// Mutation to unfollow a user
export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollow(userId: $userId)
  }
`;

// Query to get user's workouts for profile page
export const GET_USER_WORKOUTS = gql`
  query GetUserWorkouts($userId: ID!, $page: Int, $size: Int) {
    userWorkouts(userId: $userId, page: $page, size: $size) {
      content {
        id
        title
        notes
        startTime
        endTime
        durationSeconds
        caloriesBurned
        isPrivate
        exercises {
          id
          exercise {
            id
            name
            category
          }
          sets
          reps
          weightKg
        }
        likeCount
        commentCount
        isLiked
        createdAt
      }
      totalPages
      totalElements
    }
  }
`;
