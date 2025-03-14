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
    type: String
    duration: String,
    attachment: Attachment
    status: String
    startDate: Date,
    endDate: Date,
    deadline: Date,
    unitPrice: Float,
    commentCount: Int
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
  enum StatusType {
    active
    draft
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
  statuses : [String]
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
  type: String,
  categoryId: String!,
  description: String,
  duration : String,
  attachment: AttachmentInput,
  startDate: Date,
  endDate: Date,
  deadline: Date,
  unitPrice: Float!,
  status: String
`;

export const mutations = `
  programsAdd(${mutationParams}): Program
  programsRemove(programIds: [String]): JSON
  programsEdit(_id:String!, ${mutationParams}): Program
  changeProgramStatus(_id:String!, status : StatusType): Program
  
  programCategoriesAdd(${programCategoryParams}): ProgramCategory
  programCategoriesEdit(_id: String!, ${programCategoryParams}): ProgramCategory
  programCategoriesRemove(_id: String!): JSON
`;
