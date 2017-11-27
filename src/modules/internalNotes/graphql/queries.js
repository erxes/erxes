const internalNotes = `
  query internalNotes($contentType: String!, $contentTypeId: String) {
    internalNotes(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      content
      createdUserId
      createdUser {
        username
        details {
          avatar
          fullName
          position
          twitterUsername
        }
      }
    }
  }
`;

const customerActivitylogquery = `
  query activityLogsCustomer($_id: String!) {
    activityLogsCustomer(_id: $_id) {
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

export default {
  internalNotes,
  customerActivitylogquery
};
