export const assetCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  attachment: AttachmentInput,
  status: String
`;

export const assetParams = `
  name: String,
  categoryId: String,
  parentId: String,
  description: String,
  unitPrice: Float,
  code: String,
  order: String,
  customFieldsData: JSON,
  attachment: AttachmentInput,
  attachmentMore: [AttachmentInput],
  assetCount: Int,
  vendorId: String
`;
