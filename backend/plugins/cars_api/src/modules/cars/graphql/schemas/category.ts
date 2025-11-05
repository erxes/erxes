export const types = `
    type CarCategory {
    name: String
    code: String
    order: String
    parentId: String
    description: String
    image: Attachment
    secondaryImages: Attachment
    productCategoryId: String
    }

    type carCategoryListResponse {
    list: [carCategory],
    pageInfo: PageInfo
    totalCount: Int,}
`;

export const queries = `
    carCategoryDetail(_id: String!): CarCategory
    carCategories: carCategoryListResponse
`;

const mutationParams = `
    name: String!,
    code: String!,
    description: String,
    parentId: String,
    image: AttachmentInput,
    secondaryImages: [AttachmentInput],
    productCategoryId: String
`;

export const mutations = `
    carCategoriesAdd(${mutationParams}): CarCategory
    carCategoriesEdit(_id: String!, ${mutationParams}): CarCategory
    carCategoriesRemove(_id: String!): CarCategory
`;
