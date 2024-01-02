export const types = `

  extend type User @key(fields: "_id") {
      _id: String! @external
      submitStatus:String
    }

  input DateFilter {
    from:String,
    to:String
  }

`;

const commonParams = `
  cardType:String,
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
  pipelineIds:[String],
  boardId:String,
  withoutUserFilter:Boolean
`;

export const queries = `
  getCreatedUsersCards(${commonParams}):[User]
  getAssignedUsersCards(${commonParams}):[User]
  getCustomFieldUsersCards(fieldId:String,${commonParams}):[User]
`;
