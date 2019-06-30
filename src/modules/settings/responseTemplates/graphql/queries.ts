const responseTemplatesTotalCount = `
  query responseTemplatesTotalCount {
    responseTemplatesTotalCount
  }
`;

const responseTemplates = `
  query responseTemplates($page: Int, $perPage: Int) {
    responseTemplates(page: $page, perPage: $perPage) {
      _id
      name
      brandId
      brand {
        _id
        name
      }
      content
    }
  }
`;

export default {
  responseTemplates,
  responseTemplatesTotalCount
};
