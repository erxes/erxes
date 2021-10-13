import { queries as productQueries } from 'erxes-ui/lib/products/graphql';

const productTemplateFields = `
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
`

const productTemplates = `
    query productTemplates {
      productTemplates {
        ${productTemplateFields}
      }
    }
`;

const productTemplateTotalCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
  }
`;

const productTemplateDetail = `
  query productTemplateDetail($_id: String) { 
    productTemplateDetail(_id: $_id) {
      ${productTemplateFields}      
    }
  }
`;

const productTemplateCountByTags = `
  query productCountByTags {
    productCountByTags
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
  products
};
