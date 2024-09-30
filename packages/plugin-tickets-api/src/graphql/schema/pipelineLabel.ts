export const types = `
  type TicketsPipelineLabel @key(fields: "_id") {
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
  ticketsPipelineLabels(pipelineId: String, pipelineIds: [String]): [TicketsPipelineLabel]
  ticketsPipelineLabelDetail(_id: String!): TicketsPipelineLabel
`;

export const mutations = `
  ticketsPipelineLabelsAdd(${commonParams}): TicketsPipelineLabel
  ticketsPipelineLabelsEdit(_id: String!, ${commonParams}): TicketsPipelineLabel
  ticketsPipelineLabelsRemove(_id: String!): JSON
  ticketsPipelineLabelsLabel(pipelineId: String!, targetId: String!, labelIds: [String!]!): String
`;
