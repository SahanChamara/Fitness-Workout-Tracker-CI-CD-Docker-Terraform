import { gql } from "@/lib/apollo-hooks";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      refreshToken
      username
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      refreshToken
      username
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
      refreshToken
      username
    }
  }
`;

export const LOGOUT_ALL_SESSIONS_MUTATION = gql`
  mutation LogoutAllSessions {
    logoutAllSessions
  }
`;
