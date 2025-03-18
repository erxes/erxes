import {
  attachmentInput,
  attachmentType,
} from "@erxes/api-utils/src/commonTypeDefs";

export const types = () => `
  ${attachmentType}
  ${attachmentInput}
  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type Activity {
    _id: String!
    name: String
    code: String
    categoryId: String
    category: ActivityCategory
    description: String
    createdAt: Date
    type: String
    attachment: Attachment
    status: String
    startDate: Date,
    endDate: Date,
    deadline: Date,
    unitPrice: Float,
    commentCount: Int
    primaryTeacher: User
    teachers : [User]
  }

  type ActivityListResponse {
    list: [Activity],
    totalCount: Float,
  }
    
  type ActivityCategory {
    _id: String!
    name: String
    description: String
    parentId: String
    code: String!
    order: String!
    isRoot: Boolean
    activityCount: Int
    attachment: Attachment
  }
  enum StatusType {
    active
    draft
  }
`;

const activityCategoryParams = `
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
  activities(${queryParams}): ActivityListResponse
  activityDetail(_id: String!): Activity
  activityCategories(parentId: String, searchValue: String): [ActivityCategory]
  activityCategoriesTotalCount: Int
`;

const mutationParams = `
  name: String!,
  code: String!,
  type: String,
  categoryId: String!,
  description: String,
  attachment: AttachmentInput,
  startDate: Date,
  endDate: Date,
  deadline: Date,
  unitPrice: Float!,
  status: String
`;

export const mutations = `
  activityAdd(${mutationParams}): Activity
  activityEdit(_id:String!, ${mutationParams}): Activity
  activitiesRemove(activityIds: [String]): JSON
  changeActivityStatus(_id:String!, status : StatusType): Activity
  
  activityCategoryAdd(${activityCategoryParams}): ActivityCategory
  activityCategoryEdit(_id: String!, ${activityCategoryParams}): ActivityCategory
  activityCategoryRemove(_id: String!): JSON
`;
