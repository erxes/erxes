import { gql } from '@apollo/client';

export const GET_USER_DETAIL = gql`
  query GET_USER_DETAIL($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      isActive
      status
      details {
        avatar
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
        position
      }
      links
      getNotificationByEmail
    }
  }
`;

export const PROFILE_STRUCTURE_MEMBERSHIPS = gql`
  query ProfileStructureMemberships($_id: String) {
    userDetail(_id: $_id) {
      _id
      structureMemberships {
        _id
        entityId
        seatIds
        seats {
          _id
          coverage
          position {
            _id
            name
          }
        }
        isPrimary
        entity {
          _id
          typeId
          title
          code
          order
          type {
            _id
            name
            code
          }
        }
      }
    }
  }
`;
