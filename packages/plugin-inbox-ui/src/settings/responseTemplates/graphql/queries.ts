const responseTemplatesTotalCount = `
  query responseTemplatesTotalCount($brandId: String, $searchValue: String) {
    responseTemplatesTotalCount(brandId: $brandId, searchValue: $searchValue)
  }
`;

const responseTemplates = `
  query responseTemplates($page: Int, $perPage: Int, $brandId: String, $searchValue: String) {
    responseTemplates(page: $page, perPage: $perPage, brandId: $brandId, searchValue: $searchValue) {
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
  responseTemplatesTotalCount,
};
