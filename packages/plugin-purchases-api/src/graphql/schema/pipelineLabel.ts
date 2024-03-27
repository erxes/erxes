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
  pipelineLabels(pipelineId: String, pipelineIds: [String]): [PipelineLabel]
  pipelineLabelDetail(_id: String!): PipelineLabel
`;

export const mutations = `
  purchasePipelineLabelsAdd(${commonParams}): PipelineLabel
  purchasePipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  purchasePipelineLabelsRemove(_id: String!): JSON
  purchasePipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
