import { gql } from "@/lib/apollo-hooks";

export const GET_FEED = gql`
  query GetFeed($page: Int, $size: Int) {
    feed(page: $page, size: $size) {
      content {
        id
        type
        content
        createdAt
        user {
          id
          username
          displayName
          avatarUrl
        }
        workout {
          id
          title
        }
        likeCount
        commentCount
        isLiked
      }
      lastId
      hasNext
    }
  }
`;

export const LIKE_MUTATION = gql`
  mutation Like($parentType: ParentType!, $parentId: ID!) {
    like(parentType: $parentType, parentId: $parentId)
  }
`;
