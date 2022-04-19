import { queries as productQueries } from "@erxes/ui-products/src/graphql";

export const productTemplateFields = `
    _id
    title
    discount
    totalAmount
    description
    templateItems
    status
    tags {
      _id
      name
      colorCode
    }
`;

export const productTemplateParamsDef = `
  $searchValue: String,
  $tag: String,
  $status: String,
  $page: Int,
  $perPage: Int
`;

export const productTemplateParams = `
  searchValue: $searchValue,
  tag: $tag,
  status: $status,
  page: $page,
  perPage: $perPage
`;

const productTemplates = `
    query productTemplates(${productTemplateParamsDef}) {
      productTemplates(${productTemplateParams}) {
        ${productTemplateFields}
      }
    }
`;

const productTemplateTotalCount = `
  query productTemplateTotalCount {
    productTemplateTotalCount
  }
`;

const productTemplateDetail = `
  query productTemplateDetail($_id: String) {
    productTemplateDetail(_id: $_id) {
      ${productTemplateFields}
      templateItemsProduct
    }
  }
`;

const productTemplateCountByTags = `
  query productTemplateCountByTags {
    productTemplateCountByTags
  }
`;

const emailTemplateTotalCount = `
  query emailTemplatesTotalCount {
    emailTemplatesTotalCount
  }
`;

const productCategories = productQueries.productCategories;
const products = productQueries.products;

export default {
  productTemplates,
  productTemplateTotalCount,
  productTemplateDetail,
  productTemplateCountByTags,
  productCategories,
  products,
  emailTemplateTotalCount,
};
