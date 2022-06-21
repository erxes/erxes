const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int, $searchValue: String) {
    emailTemplates(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      name
      content
      createdAt
      status
      modifiedAt
      createdUser {
        _id
        username
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const totalCount = `
  query emailTemplatesTotalCount {
    emailTemplatesTotalCount
  }
`;

export default {
  emailTemplates,
  totalCount
};
