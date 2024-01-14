export const types = `

  extend type User @key(fields: "_id") {
      _id: String! @external
      submitStatus:String
  }

  extend type KnowledgeBaseArticle @key(fields: "_id") {
      _id: String! @external
  }

  type KBCategory {
    _id: String
    title: String
    description: String
    articles: [KnowledgeBaseArticle]
    icon: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    parentCategoryId: String

    authors: [User]
    numOfArticles: Float
    countArticles:Int
  } 

  extend type Ticket @key(fields: "_id") {
      _id: String! @external
      kbCategory:KBCategory,
      grant:JSON
  }

  input DateFilter {
    from:String,
    to:String
  }

  input fieldFilter {
    field:String,
    value:String,
    values:[String],
    regex:Boolean
  }

`;

const commonParams = `
  stageIds:[String],
  stageCodes:[String],
  branchIds:[String],
  departmentIds:[String],
  assignedUserIds:[String],
  searchValue:String,
  labelIds:[String],
  createdAt:DateFilter,
  startedAt:DateFilter,
  closedAt:DateFilter,

`;

const commonUserParams = `
  ${commonParams}
  cardType:String,
  pipelineIds:[String],
  boardId:String,
  withoutUserFilter:Boolean
`;

export const queries = `
  getCreatedUsersCards(${commonUserParams}):[User]
  getAssignedUsersCards(${commonUserParams}):[User]
  getCustomFieldUsersCards(fieldId:String,${commonUserParams}):[User]
  myStandartKnowledges(customFieldsFilter:[fieldFilter],grantFilters:[fieldFilter],kbFieldId:String!,${commonParams}):[Ticket]
`;
