import { gql } from '~/gql';

export const POS_USERS_QUERY = gql(`
  query salesPosCoversUsers(
    $page: Int
    $perPage: Int
    $status: String
    $searchValue: String
    $isActive: Boolean
  ) {
    posUsers(
      page: $page
      perPage: $perPage
      status: $status
      searchValue: $searchValue
      isActive: $isActive
    ) {
      _id
      createdAt
      username
      firstName
      lastName
      primaryPhone
      primaryEmail
      email
      isActive
      isOwner
      details {
        avatar
        fullName
        shortName
        birthDate
        position
        workStartedDate
        location
        description
        operatorPhone
      }
    }
  }
`);
