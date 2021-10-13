const productTemplateParamsDef = `
  $type: String
  $title: String
  $discount: Int
  $totalAmount: Int
  $description: String
  $templateItems: JSON
  $status: String
`;

const productTemplateParams = `
  type: $type
  title: $title
  discount: $discount
  totalAmount: $totalAmount
  description: $description
  templateItems: $templateItems
  status: $status
`;

const productTemplatesAdd = `
  mutation productTemplatesAdd(${productTemplateParamsDef}) {
    productTemplatesAdd(${productTemplateParams}) {
      _id
    }
  }
`;

const productTemplatesEdit = `
  mutation productTemplatesEdit($_id: String!, ${productTemplateParamsDef}) {
    productTemplatesEdit(_id: $_id, ${productTemplateParams}) {
      _id
    }
  }
`;

const productTemplatesRemove = `
  mutation productTemplatesRemove($ids: [String!]) {
    productTemplatesRemove(ids: $ids)
  }
`;

export default {
  productTemplatesAdd,
  productTemplatesEdit,
  productTemplatesRemove
};
