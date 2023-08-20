const productParamsDef = `
  $name: String,
  $type: String,
  $categoryId: String,
  $description: String,
  $barcodes: [String],
  $barcodeDescription: String,
  $unitPrice: Float,
  $code: String
  $customFieldsData: JSON,
  $attachment: AttachmentInput,
  $attachmentMore: [AttachmentInput],
  $vendorId: String,
  $uom: String,
  $subUoms: JSON,
  $taxType: String,
  $taxCode: String
`;

const productCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $description: String,
  $attachment: AttachmentInput,
  $status: String,
  $meta: String
`;

const productParams = `
  name: $name,
  type: $type,
  categoryId: $categoryId,
  description: $description,
  barcodes: $barcodes,
  barcodeDescription: $barcodeDescription,
  unitPrice: $unitPrice,
  code: $code,
  customFieldsData: $customFieldsData,
  attachment: $attachment,
  attachmentMore: $attachmentMore,
  vendorId: $vendorId,
  uom: $uom,
  subUoms: $subUoms,
  taxType: $taxType,
  taxCode: $taxCode
`;

const productCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  description: $description,
  attachment: $attachment,
  status: $status,
  meta: $meta
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

const productsRemove = `
  mutation productsRemove($productIds: [String!]) {
    productsRemove(productIds: $productIds)
  }
`;

const productsConfigsUpdate = `
  mutation productsConfigsUpdate($configsMap: JSON!) {
    productsConfigsUpdate(configsMap: $configsMap)
  }
`;

export default {
  productAdd,
  productEdit,
  productsRemove,
  productCategoryAdd,
  productCategoryEdit,
  productsConfigsUpdate
};
