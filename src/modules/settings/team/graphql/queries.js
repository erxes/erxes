const users = `
  query users($page: Int, $perPage: Int) {
    users(page: $page, perPage: $perPage) {
      _id
      username
      email
      role
      groupIds
      details {
        avatar
        fullName
        position
        description
        location
        twitterUsername
      }
      links {
        linkedIn
        twitter
        facebook
        github
        youtube
        website
      }
    }
  }
`;

export default { users };
