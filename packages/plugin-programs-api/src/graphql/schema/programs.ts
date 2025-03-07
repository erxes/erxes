import {
  attachmentInput,
  attachmentType,
} from "@erxes/api-utils/src/commonTypeDefs";

export const types = () => `
  ${attachmentType}
  ${attachmentInput}
  type Program {
    _id: String!
    name: String
    code: String
    categoryId: String
    category: ProgramCategory
    description: String
    createdAt: Date
    studyMode: String
    attachment: Attachment
    status : String
    startDate: Date,
    endDate: Date,
    finishDate: Date,
  }

  type ProgramListResponse {
    list: [Program],
    totalCount: Float,
  }
    
  type ProgramCategory {
    _id: String!
    name: String
    description: String
    parentId: String
    code: String!
    order: String!
    isRoot: Boolean
    programCount: Int
    attachment: Attachment
  }
`;

const programCategoryParams = `
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
  programs(${queryParams}): ProgramListResponse
  programDetail(_id: String!): Program
  programCategories(parentId: String, searchValue: String): [ProgramCategory]
  programCategoriesTotalCount: Int
`;

const mutationParams = `
  name: String!,
  code: String!,
  description: String,
  attachment: AttachmentInput,
`;

export const mutations = `
  programsAdd(${mutationParams}): Program
  programsRemove(_id: String!): JSON
  programsEdit(_id:String!, ${mutationParams}): Program
  programCategoriesAdd(${programCategoryParams}): ProgramCategory
`;
