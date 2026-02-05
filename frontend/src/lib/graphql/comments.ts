import { gql } from "@/lib/apollo-hooks";

// Query to get comments for a workout
export const GET_COMMENTS = gql`
  query GetComments($parentType: ParentType!, $parentId: ID!, $page: Int, $size: Int) {
    comments(parentType: $parentType, parentId: $parentId, page: $page, size: $size) {
      content {
        id
        user {
          id
          username
          displayName
          avatarUrl
        }
        content
        createdAt
      }
      totalPages
      totalElements
    }
  }
`;

// Mutation to add a comment
export const ADD_COMMENT = gql`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
      user {
        id
        username
        displayName
        avatarUrl
      }
      content
      createdAt
    }
  }
`;

// Mutation to delete a comment
export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;
