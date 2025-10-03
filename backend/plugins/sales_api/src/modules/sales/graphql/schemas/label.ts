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

export const queries = `
  salesPipelineLabels(pipelineId: String, pipelineIds: [String]): [SalesPipelineLabel]
  salesPipelineLabelDetail(_id: String!): SalesPipelineLabel
`;

const mutationParams = `
  name: String!
  colorCode: String!
  pipelineId: String!
`;

export const mutations = `
  salesPipelineLabelsAdd(${mutationParams}): SalesPipelineLabel
  salesPipelineLabelsEdit(_id: String!, ${mutationParams}): SalesPipelineLabel
  salesPipelineLabelsRemove(_id: String!): JSON
  salesPipelineLabelsLabel(targetId: String!, labelIds: [String!]!): String
`;
