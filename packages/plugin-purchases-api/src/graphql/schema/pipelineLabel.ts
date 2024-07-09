export const types = `
  type PurchasePipelineLabel @key(fields: "_id") {
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
  purchasePipelineLabels(pipelineId: String, pipelineIds: [String]): [PurchasePipelineLabel]
  purchasePipelineLabelDetail(_id: String!): PurchasePipelineLabel
`;

export const mutations = `
  purchasePipelineLabelsAdd(${commonParams}): PurchasePipelineLabel
  purchasePipelineLabelsEdit(_id: String!, ${commonParams}): PurchasePipelineLabel
  purchasePipelineLabelsRemove(_id: String!): JSON
  purchasePipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
