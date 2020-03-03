export const types = `
  type Shape {
    _id: String!
    automationId: String
    type: String
    kind: String
    async: Boolean
    position: JSON
    size: JSON
    toArrow: [String]
    config: JSON
    configFormat: JSON
  }

  type Automation {
    _id: String!
    name: String
    description: String
    status: String
    shapes: [Shape]
  }

`;

// const queryParams = ``;

const commonFields = `
  name: String,
  description: String,
  userId: String,
  modifiedBy: String,
`;

const shapeFields = `
  type: String,
  kind: String,
  position: JSON,
  size: JSON,
  toArrow: [String],
  config: JSON,
`;

export const queries = `
  automations: [Automation]
  automationDetail(_id: String!): Automation
`;

export const mutations = `
  automationsAdd(${commonFields}): Automation
  automationsEdit(_id: String!, ${commonFields}): Automation
  automationsRemove(_id: String!): Automation

  shapesAdd(automationId: String, ${shapeFields}): Shape
  shapesEdit(_id: String!, ${shapeFields}): Shape
  shapesRemove(_id: String!): Shape
`;
