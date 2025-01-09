export const types = `
  type TasksPipelineLabel @key(fields: "_id") {
    _id: String!
    name: String!
    colorCode: String
    pipelineId: String
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  colorCode: String!
  pipelineId: String!
`;

export const queries = `
  tasksPipelineLabels(pipelineId: String, pipelineIds: [String]): [TasksPipelineLabel]
  tasksPipelineLabelDetail(_id: String!): TasksPipelineLabel
`;

export const mutations = `
  tasksPipelineLabelsAdd(${commonParams}): TasksPipelineLabel
  tasksPipelineLabelsEdit(_id: String!, ${commonParams}): TasksPipelineLabel
  tasksPipelineLabelsRemove(_id: String!): JSON
  tasksPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
