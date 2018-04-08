const integrations = `
  query integrations($brandId: String, $perPage: Int, $page: Int, $searchValue: String) {
    integrations(brandId: $brandId, perPage: $perPage, page: $page, searchValue: $searchValue) {
      _id
      brandId
      name
      kind
      brand {
        _id
        name
        code
      }
      formData
      formId
      form {
        _id
        title
        code
      }
      channels {
        _id
        name
      }
    }
  }
`;

const brandDetail = `
  query brandDetail($_id: String!) {
    brandDetail(_id: $_id) {
      _id
      name
      code
      integrations {
        _id
        name
        kind
        brandId
      }
    }
  }
`;

const brands = `
  query brands($page: Int, $perPage: Int) {
    brands(page: $page, perPage: $perPage) {
      _id
      code
      name
      createdAt
      description
    }
  }
`;

const brandsCount = `
  query totalBrandsCount {
    brandsTotalCount
  }
`;

const integrationsCount = `
  query totalIntegrationsCount {
    integrationsTotalCount
  }
`;

const brandsGetLast = `
  query brandsGetLast {
    brandsGetLast {
      _id
    }
  }
`;

export default {
  integrations,
  brandsGetLast,
  brands,
  brandDetail,
  brandsCount,
  integrationsCount
};
