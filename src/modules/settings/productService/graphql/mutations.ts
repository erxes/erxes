const productParamsDef = `
  $name: String!,
  $type: String!,
  $description: String,
  $sku: String
`;

const productCategoryParamsDef = `
  $name: String!,
  $parentId: String,
  $description: String,
`;

const productParams = `
  name: $name,
  type: $type,
  description: $description,
  sku: $sku
`;

const productCategoryParams = `
  name: $name,
  parentId: $parentId,
  description: $description,
`;

const productAdd = `
  mutation productsAdd(${productParamsDef}) {
    productsAdd(${productParams}) {
      _id
    }
  }
`;

const productEdit = `
  mutation productsEdit($_id: String!, ${productParamsDef}) {
    productsEdit(_id: $_id, ${productParams}) {
      _id
    }
  }
`;

const productRemove = `
  mutation productsRemove($_id: String!) {
    productsRemove(_id: $_id)
  }
`;

const productCategoryAdd = `
  mutation productCategoriesAdd(${productCategoryParamsDef}) {
    productCategoriesAdd(${productCategoryParams}) {
      _id
    }
  }
`;

const productCategoryEdit = `
  mutation productCategoriesEdit($_id: String!, ${productCategoryParamsDef}) {
    productCategoriesEdit(_id: $_id, ${productCategoryParams}) {
      _id
    }
  }
`;

const productCategoryRemove = `
  mutation productCategoriesRemove($_id: String!) {
    productCategoriesRemove(_id: $_id)
  }
`;

export default {
  productAdd,
  productEdit,
  productRemove,
  productCategoryAdd,
  productCategoryEdit,
  productCategoryRemove
};
