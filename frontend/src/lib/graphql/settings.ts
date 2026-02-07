import { gql } from "@apollo/client";

// Update user profile (display name, bio, avatar)
export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      displayName
      bio
      avatarUrl
    }
  }
`;

// Change password mutation
export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

// Delete account mutation
export const DELETE_ACCOUNT_MUTATION = gql`
  mutation DeleteAccount {
    deleteAccount
  }
`;

// Get presigned URL for avatar upload
export const GET_UPLOAD_URL_MUTATION = gql`
  mutation GetUploadUrl($input: GetUploadUrlInput!) {
    getUploadUrl(input: $input) {
      uploadUrl
      fileUrl
    }
  }
`;

// Get current user profile
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      displayName
      bio
      avatarUrl
      createdAt
    }
  }
`;
