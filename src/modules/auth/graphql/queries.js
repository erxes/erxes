const currentUser = `
  query currentUser {
    currentUser {
      _id
      username
      email
      details
      emailSignatures
    }
  }
`;

export default {
  currentUser
};
