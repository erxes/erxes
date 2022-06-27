import { mutations as productMutations } from '@erxes/ui-products/src/graphql';

const productAdd = productMutations.productAdd;

const productEdit = productMutations.productEdit;

const productsRemove = productMutations.productsRemove;

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

// UOM

const uomsAdd = `
  mutation uomsAdd($name: String, $code: String) {
    uomsAdd(name: $name, code: $code) {
      _id
      name
      code
      createdAt
    }
  }
`;

const uomsEdit = `
  mutation uomsEdit($id: String!, $name: String, $code: String) {
    uomsEdit(_id: $id, name: $name, code: $code) {
      _id
      name
      code
      createdAt
    }
  }
`;

const uomsRemove = `
  mutation uomsRemove($uomIds: [String!]) {
    uomsRemove(uomIds: $uomIds)
  }
`;

// Settings

const productsConfigsUpdate = productMutations.productsConfigsUpdate;

export default {
  productAdd,
  productEdit,
  productsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productCategoryRemove,
  productsMerge,

  uomsAdd,
  uomsEdit,
  uomsRemove,

  productsConfigsUpdate
};
