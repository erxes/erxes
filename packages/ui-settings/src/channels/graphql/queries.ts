const channels = `
  query channels($memberIds: [String]) {
    channels(memberIds: $memberIds) {
      _id
      name
      description
      integrationIds
      memberIds
      members {
        _id
        email
        details {
          avatar
          fullName
        }
      }
    }
  }
`;

export default { channels };
