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
    integrationsTotalCount {
      byBrand
    }
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
  brandDetail,
  brands,
  brandsCount,
  brandsGetLast,
  integrationsCount
};
