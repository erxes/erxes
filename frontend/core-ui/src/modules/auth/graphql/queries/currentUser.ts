import { gql } from '@apollo/client';

export const currentUser = gql`
  query currentUser {
    currentUser {
      _id
      createdAt
      username
      email
      isOwner
      role
      details {
        avatar
        fullName
        birthDate
        shortName
        workStartedDate
        position
        description
        location
      }
      links
      emailSignatures
      getNotificationByEmail
      permissionActions
      configs
      isShowNotification
    }
  }
`;
