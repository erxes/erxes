import { mutations as productMutations } from '@erxes/ui-products/src/graphql';

const productAdd = productMutations.productAdd;

const productEdit = productMutations.productEdit;

const productsRemove = productMutations.productsRemove;

const productCategoryAdd = productMutations.productCategoryAdd;
const productCategoryEdit = productMutations.productCategoryEdit;

const itemParamsDef = `
  $name: String,
  $code: String,
  $description: String
`;

const itemParams = `
  name: $name,
  code: $code,
  description: $description
`;

const itemsAdd = `
  mutation itemsAdd(${itemParamsDef}) {
    itemsAdd(${itemParams}) {
      _id
    }
  }
`;

const itemEdit = `
  mutation itemsEdit($_id: String!, ${itemParamsDef}) {
    itemsEdit(_id: $_id, ${itemParams}) {
      _id
    }
  }
`;

const itemsRemove = `
  mutation itemsRemove($itemIds: [String!]) {
    itemsRemove(itemIds: $itemIds)
  }
`;

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
  itemsAdd,
  itemEdit,
  itemsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productCategoryRemove,
  productsMerge,

  uomsAdd,
  uomsEdit,
  uomsRemove,

  productsConfigsUpdate,
};
