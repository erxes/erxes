import { mutations as productMutations } from 'erxes-ui/lib/products/graphql';

const productAdd = productMutations.productAdd;

const productEdit = productMutations.productEdit;

const productsRemove = `
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

const productCategoryAdd = productMutations.productCategoryAdd;
const productCategoryEdit = productMutations.productCategoryEdit;

const productCategoryRemove = `
  mutation productCategoriesRemove($_id: String!) {
    productCategoriesRemove(_id: $_id)
  }
`;

const productsMerge = `
  mutation productsMerge($productIds: [String], $productFields: JSON) {
    productsMerge(productIds: $productIds, productFields: $productFields) {
      _id
    }
  }
`;

const productSelectFeature = `
  mutation productSelectFeature($_id: String, $counter: String) {
    productSelectFeature(_id: $_id, counter: $counter) {
      _id
    }
  }
`;

export default {
  productAdd,
  productEdit,
  productsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productCategoryRemove,
  productsMerge,
  productSelectFeature
};
