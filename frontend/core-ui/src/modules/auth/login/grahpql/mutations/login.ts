import { gql } from '@apollo/client';

export const Login = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle {
    loginWithGoogle
  }
`;

export const LOGIN_WITH_MAGIC_LINK = gql`
  mutation LoginWithMagicLink($email: String!) {
    loginWithMagicLink(email: $email)
  }
`;
