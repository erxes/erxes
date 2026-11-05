import { gql } from '@apollo/client';

export const GET_USER_DETAIL = gql`
  query GET_USER_DETAIL($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      isActive
      isOnboarded
      status
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
      getNotificationByEmail
    }
  }
`;
