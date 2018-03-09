const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      role
      conversations {
        _id
        createdAt
        customer {
          _id
          firstName
          lastName
          email
          phone
        }
      }
      details {
        avatar
        fullName
        position
        location
        description
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

const userActivityLog = `
query activityLogsUser($_id: String!) {
  activityLogsUser(_id: $_id) {
    date {
      year
      month
    }
    list {
      id
      action
      content
      createdAt
      by {
        _id
        type
        details {
          avatar
          fullName
        }
      }
    }
  }
}
`;

const channels = `
  query channels($memberIds: [String]) {
    channels(memberIds: $memberIds) {
      _id
      name
      description
      memberIds
    }
  }
`;

export default { userDetail, channels, userActivityLog };
