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
  pipelineLabelsAdd(${commonParams}): PipelineLabel
  pipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  pipelineLabelsRemove(_id: String!): JSON
  pipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
