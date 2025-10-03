import { gql } from '@apollo/client';

export const CreateOwner = gql`
  mutation usersCreateOwner(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String
    $purpose: String
    $subscribeEmail: Boolean
  ) {
    usersCreateOwner(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      purpose: $purpose
      subscribeEmail: $subscribeEmail
    )
  }
`;
