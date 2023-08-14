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
  query emailTemplatesTotalCount($searchValue: String) {
    emailTemplatesTotalCount(searchValue: $searchValue)
  }
`;

const emailTemplate = `
query EmailTemplate($_id: String) {
  emailTemplate(_id: $_id) {
    _id
    name
    content
    status
    createdBy
    createdAt
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

export default {
  emailTemplates,
  emailTemplate,
  totalCount
};
