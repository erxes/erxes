export const types = `

  type FlowCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    createdAt: Date,
    name: String,
    code: String,
    order: String,
    isRoot: Boolean,
    description: String,
    parentId: String,
    attachment: Attachment,
    status: String,
    flowCount: Int
  }
`;

export const queries = `
  flowCategories(parentId: String, searchValue: String, status: String): [FlowCategory]
  flowCategoriesTotalCount: Int
`;
