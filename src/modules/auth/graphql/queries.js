const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      details
    }
  }
`;

export default {
  currentUser
};
