export const types = `
  type SalesPipelineLabel @key(fields: "_id") {
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
  pipelineLabels(pipelineId: String, pipelineIds: [String]): [SalesPipelineLabel]
  pipelineLabelDetail(_id: String!): PipelineLabel
`;

export const mutations = `
  pipelineLabelsAdd(${commonParams}): SalesPipelineLabel
  pipelineLabelsEdit(_id: String!, ${commonParams}): SalesPipelineLabel
  pipelineLabelsRemove(_id: String!): JSON
  pipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
