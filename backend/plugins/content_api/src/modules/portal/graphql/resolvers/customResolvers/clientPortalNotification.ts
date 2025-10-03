
export default {
  async createdUser(clientPortalNotification) {

    if (!clientPortalNotification.createdUser) {
      return null;
    }

    return {
      _id: clientPortalNotification.createdUser,
      __typename: 'User',
    };
  }
};
