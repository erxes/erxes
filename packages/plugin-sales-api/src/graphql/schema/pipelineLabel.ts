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
  salesPipelineLabels(pipelineId: String, pipelineIds: [String]): [SalesPipelineLabel]
  salesPipelineLabelDetail(_id: String!): SalesPipelineLabel
`;

export const mutations = `
  salesPipelineLabelsAdd(${commonParams}): SalesPipelineLabel
  salesPipelineLabelsEdit(_id: String!, ${commonParams}): SalesPipelineLabel
  salesPipelineLabelsRemove(_id: String!): JSON
  salesPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
