export const assetCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $description: String,
  $attachment: AttachmentInput,
  $status: String,
`;

export const assetCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  description: $description,
  attachment: $attachment,
  status: $status,
`;
