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
  ghPipelineLabelsAdd(${commonParams}): PipelineLabel
  ghPipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  ghPipelineLabelsRemove(_id: String!): JSON
  ghPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
