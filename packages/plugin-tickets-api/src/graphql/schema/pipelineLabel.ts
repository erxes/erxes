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
  ticketPipelineLabelsAdd(${commonParams}): PipelineLabel
  ticketPipelineLabelsEdit(_id: String!, ${commonParams}): PipelineLabel
  ticketPipelineLabelsRemove(_id: String!): JSON
  ticketPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
