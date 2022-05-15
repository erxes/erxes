import { queries as productQueries } from '@erxes/ui-products/src/graphql';

const productFields = productQueries.productFields;

const productCategories = productQueries.productCategories;

const products = productQueries.products;

const productsCount = `
  query productsTotalCount($type: String) {
    productsTotalCount(type: $type)
  }
`;

const productCountByTags = `
  query productCountByTags {
    productCountByTags
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
  }
`;

const productDetail = `
  query productDetail($_id: String) {
    productDetail(_id: $_id) {
      ${productFields}
      customFieldsData
    }
  }
`;

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      name
      productCount
    }
  }
`;

// UOM

const uoms = `
query uoms {
  uoms {
    _id
    name
    code
    createdAt
  }
}
`;

const uomsTotalCount = `
query uomsTotalCount {
  uomsTotalCount
}
`;

// Settings

const productsConfigs = `
  query productsConfigs {
    productsConfigs {
      _id
      code
      value
    }
  }
`;

export default {
  products,
  productDetail,
  productCountByTags,
  productsCount,
  productCategories,
  productCategoriesCount,
  productCategoryDetail,

  uoms,
  uomsTotalCount,

  productsConfigs
};
