const commonParamsDef = `
  $name: String!,
  $type: String!,
  $description: String,
  $sku: String
`;

const commonParams = `
  name: $name,
  type: $type,
  description: $description,
  sku: $sku
`;

const productAdd = `
  mutation productsAdd(${commonParamsDef}) {
    productsAdd(${commonParams}) {
      _id
    }
  }
`;

const productEdit = `
  mutation productsEdit($_id: String!, ${commonParamsDef}) {
    productsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const productRemove = `
  mutation productsRemove($_id: String!) {
    productsRemove(_id: $_id)
  }
`;

export default {
  productAdd,
  productEdit,
  productRemove
};
