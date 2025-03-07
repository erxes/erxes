import {
  attachmentInput,
  attachmentType,
} from "@erxes/api-utils/src/commonTypeDefs";

export const types = () => `
  ${attachmentType}
  ${attachmentInput}
  type Curriculum {
    _id: String!
    name: String
    code: String
    categoryId: String
    category: CurriculumCategory
    description: String
    createdAt: Date
    studyMode: String
    attachment: Attachment
    status : String
    startDate: Date,
    endDate: Date,
    finishDate: Date,
  }

  type CurriculumListResponse {
    list: [Curriculum],
    totalCount: Float,
  }
    
  type CurriculumCategory {
    _id: String!
    name: String
    description: String
    parentId: String
    code: String!
    order: String!
    isRoot: Boolean
    curriculumCount: Int
    attachment: Attachment
  }
`;

const curriculumCategoryParams = `
  name: String!,
  code: String!,
  description: String,
  parentId: String,
  attachment: AttachmentInput,
`;

const queryParams = `
  page: Int
  perPage: Int
  categoryId: String
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  categoryId: String
`;

export const queries = `
  curriculums(${queryParams}): [CurriculumListResponse]
  curriculumDetail(_id: String!): Curriculum
  curriculumCategories(parentId: String, searchValue: String): [CurriculumCategory]
  curriculumCategoriesTotalCount: Int
`;

const mutationParams = `
  name: String!,
  code: String!,
  description: String,
  attachment: AttachmentInput,
`;

export const mutations = `
  curriculumsAdd(${mutationParams}): Curriculum
  curriculumsRemove(_id: String!): JSON
  curriculumsEdit(_id:String!, ${mutationParams}): Curriculum
  curriculumCategoriesAdd(${curriculumCategoryParams}): CurriculumCategory
`;
