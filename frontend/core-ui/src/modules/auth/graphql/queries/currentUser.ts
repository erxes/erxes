import { gql } from '@apollo/client';

export const currentUser = gql`
  query currentUser {
    currentUser {
      _id
      createdAt
      username
      email
      isOwner
      details {
        avatar
        fullName
        firstName
        lastName
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
      configs
      isOnboarded
      hasPassword
      isShowNotification
    }
  }
`;
