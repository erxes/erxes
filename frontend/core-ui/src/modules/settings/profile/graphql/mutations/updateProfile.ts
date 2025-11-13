import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation usersEditProfile(
    $username: String!
    $email: String!
    $details: UserDetails
    $links: JSON
    $employeeId: String
    $positionIds: [String]
  ) {
    usersEditProfile(
      username: $username
      email: $email
      details: $details
      links: $links
      employeeId: $employeeId
      positionIds: $positionIds
    ) {
      _id
    }
  }
`;
