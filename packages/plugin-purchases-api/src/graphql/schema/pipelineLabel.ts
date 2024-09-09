export const types = `
  type PurchasesPipelineLabel @key(fields: "_id") {
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
  purchasesPipelineLabels(pipelineId: String, pipelineIds: [String]): [PurchasesPipelineLabel]
  purchasesPipelineLabelDetail(_id: String!): PurchasesPipelineLabel
`;

export const mutations = `
  purchasesPipelineLabelsAdd(${commonParams}): PurchasesPipelineLabel
  purchasesPipelineLabelsEdit(_id: String!, ${commonParams}): PurchasesPipelineLabel
  purchasesPipelineLabelsRemove(_id: String!): JSON
  purchasesPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
