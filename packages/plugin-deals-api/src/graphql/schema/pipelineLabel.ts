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
  dealPipelineLabels(pipelineId: String, pipelineIds: [String]): [PipelineLabel]
  dealPipelineLabelDetail(_id: String!): PipelineLabel
`;

export const mutations = `
  dealPipelineLabelsAdd(${commonParams}): PipelineLabel
  dealPipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  dealPipelineLabelsRemove(_id: String!): JSON
  dealPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
