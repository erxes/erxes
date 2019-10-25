export const types = `
  type PipelineLabel {
    _id: String!
    name: String!
    type: String
    colorCode: String
    pipelineId: String
    createdBy: String
    createdAt: Date
  }
`;

const commonParams = `
  name: String!
  type: String!
  colorCode: String!
  pipelineId: String!
`;

export const queries = `
  pipelineLabels(type: String!, pipelineId: String!): [PipelineLabel]
  pipelineLabelDetail(_id: String!): PipelineLabel
`;

export const mutations = `
  pipelineLabelsAdd(${commonParams}): PipelineLabel
  pipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  pipelineLabelsRemove(_id: String!): JSON
  pipelineLabelsLabel(type: String!, targetId: String!, labelIds: [String!]!): String
`;
