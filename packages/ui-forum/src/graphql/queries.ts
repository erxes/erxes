const clientPortalUserQuery = `
  query ClientPortalUserDetail($id: String!) {
    clientPortalUserDetail(_id: $id) {
      _id
      email
      username
      type
      forumSubscriptionEndsAfter
    }
  }
`;

export default {
  clientPortalUserQuery
};
