const currentUser = `
  query currentUser {
    clientPortalCurrentUser {
      _id
      email
      phone
      firstName
      lastName

      notificationSettings {
        configs {
          isAllowed
          label
          notifType
        }
        receiveByEmail
        receiveBySms
      }
    }
  }
`;

export default { currentUser };
