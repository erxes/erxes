import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation usersEditProfilePatch(
    $username: String
    $email: String
    $details: UserDetails
    $links: JSON
    $positionIds: [String!]
  ) {
    usersEditProfilePatch(
      username: $username
      email: $email
      details: $details
      links: $links
      positionIds: $positionIds
    ) {
      _id
      username
      email
      isOnboarded
      details {
        avatar
        coverPhoto
        position
        location
        fullName
        shortName
        description
        firstName
        middleName
        lastName
        employeeId
        operatorPhone
        birthDate
        workStartedDate
      }
      positionIds
      links
    }
  }
`;
