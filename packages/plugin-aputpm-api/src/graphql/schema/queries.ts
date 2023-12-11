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

const createdUsersParams = `
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
`;

export const queries = `
  getCreatedUsersCards(${createdUsersParams}):[User]
  getAssignedUsersCards(${createdUsersParams}):[User]
  getCustomFieldUsersCards(fieldId:String,${createdUsersParams}):[User]
`;
