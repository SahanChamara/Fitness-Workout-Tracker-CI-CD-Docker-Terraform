import { gql } from "@/lib/apollo-hooks";

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
        mediaUrls
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
          durationSeconds
          orderIndex
        }
        likeCount
        commentCount
        isLiked
        user {
          id
          username
          displayName
          avatarUrl
        }
        createdAt
      }
      totalPages
      totalElements
    }
  }
`;

export const GET_WORKOUT = gql`
  query GetWorkout($id: ID!) {
    workout(id: $id) {
      id
      title
      notes
      startTime
      endTime
      durationSeconds
      caloriesBurned
      isPrivate
      mediaUrls
      exercises {
        id
        exercise {
          id
          name
          category
          description
          mediaUrl
        }
        sets
        reps
        weightKg
        durationSeconds
        orderIndex
        notes
      }
      likeCount
      commentCount
      isLiked
      user {
        id
        username
        displayName
        avatarUrl
      }
      createdAt
    }
  }
`;

export const CREATE_WORKOUT_MUTATION = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      id
      title
      notes
      startTime
      endTime
      exercises {
        id
        exercise {
          id
          name
        }
        sets
        reps
        weightKg
      }
    }
  }
`;

export const DELETE_WORKOUT_MUTATION = gql`
  mutation DeleteWorkout($id: ID!) {
    deleteWorkout(id: $id)
  }
`;
