import { gql } from '@apollo/client';

export const ForgotPassword = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;
