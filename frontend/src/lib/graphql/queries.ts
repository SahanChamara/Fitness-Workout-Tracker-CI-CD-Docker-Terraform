import { gql } from "@/lib/apollo-hooks";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      displayName
      avatarUrl
      status
    }
  }
`;
