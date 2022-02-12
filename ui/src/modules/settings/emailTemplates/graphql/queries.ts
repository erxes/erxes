const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int, $searchValue: String) {
    emailTemplates(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      name
      content
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
