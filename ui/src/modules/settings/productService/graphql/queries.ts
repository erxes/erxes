import { queries as productQueries } from 'erxes-ui/lib/products/graphql';

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
      vendor {
        _id
        code
        primaryName
      }
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

export default {
  products,
  productDetail,
  productCountByTags,
  productsCount,
  productCategories,
  productCategoriesCount,
  productCategoryDetail
};
