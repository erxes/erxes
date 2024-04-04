export default {
  async pinnedUsersInfo(pinnedUser) {
    if (!pinnedUser.pinnedUserIds) return null;
    return (pinnedUser.pinnedUserIds || []).map(userId => {
      return {
        __typename: 'User',
        _id: userId
      };
    });
  }
};
