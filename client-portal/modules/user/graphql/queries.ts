const currentUser = `
  query currentUser {
    clientPortalCurrentUser {
      _id
      email
      firstName
      lastName
    }
  }
`;

export { currentUser };
