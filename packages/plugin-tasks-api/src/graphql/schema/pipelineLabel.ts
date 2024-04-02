export const types = `
  type PipelineLabel @key(fields: "_id") {
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
  taskPipelineLabels(pipelineId: String, pipelineIds: [String]): [PipelineLabel]
  taskPipelineLabelDetail(_id: String!): PipelineLabel
`;

export const mutations = `
  taskPipelineLabelsAdd(${commonParams}): PipelineLabel
  taskPipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  taskPipelineLabelsRemove(_id: String!): JSON
  taskPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
