const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int, $searchValue: String, $status: String) {
    emailTemplates(page: $page, perPage: $perPage, searchValue: $searchValue, status: $status) {
      _id
      name
      content
      status
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
