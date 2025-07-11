const productParamsDef = `
  $name: String,
  $shortName: String,
  $type: String,
  $categoryId: String,
  $description: String,
  $barcodes: [String],
  $variants: JSON,
  $barcodeDescription: String,
  $unitPrice: Float,
  $code: String
  $customFieldsData: JSON,
  $attachment: AttachmentInput,
  $attachmentMore: [AttachmentInput],
  $pdfAttachment: PdfAttachmentInput
  $vendorId: String,
  $scopeBrandIds: [String]
  $uom: String,
  $subUoms: JSON,
  $currency: String,
  $bundleId: String
`;

const productCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $scopeBrandIds: [String]
  $description: String,
  $attachment: AttachmentInput,
  $status: String,
  $meta: String,
  $maskType: String,
  $mask: JSON,
  $isSimilarity: Boolean,
  $similarities: JSON,
`;

const productParams = `
  name: $name,
  shortName: $shortName,
  type: $type,
  categoryId: $categoryId,
  description: $description,
  barcodes: $barcodes,
  variants: $variants,
  barcodeDescription: $barcodeDescription,
  unitPrice: $unitPrice,
  code: $code,
  customFieldsData: $customFieldsData,
  attachment: $attachment,
  attachmentMore: $attachmentMore,
  pdfAttachment: $pdfAttachment,
  vendorId: $vendorId,
  scopeBrandIds: $scopeBrandIds,
  uom: $uom,
  subUoms: $subUoms,
  currency: $currency,
  bundleId: $bundleId,
`;

const productCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  scopeBrandIds: $scopeBrandIds,
  description: $description,
  attachment: $attachment,
  status: $status,
  meta: $meta,
  maskType: $maskType,
  mask: $mask,
  isSimilarity: $isSimilarity,
  similarities: $similarities,
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
  productsConfigsUpdate,
};
