export const types = `

  type View {
    _id: String!
    name: String

    createdAt:Date
    createdBy: String
    
    updatedAt:Date
    updatedBy: String

    serviceName: String
    contentType: String

    viewType: String
    viewConfig: JSON
  }

  type ViewResponse {
    list: [View]
    totalCount: Int
  }
`;

const queryParams = `
  viewType: String,
  contentType: String
`;

export const queries = `
  view(_id: String!): View
  viewList(${queryParams}): ViewResponse
`;

const mutationParams = `
  name: String,
  serviceName: String
  contentType: String
  viewType: String,
  viewConfig: JSON
`;

export const mutations = `
  viewAdd(${mutationParams}): View
  viewEdit(_id: String!, ${mutationParams}): View
  viewRemove(_id: String!): JSON
`;
