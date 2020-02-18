const commonParams = ``;

const commonParamDefs = ``;

const automations = `
  query automations(
    ${commonParams}
  ) {
    automations(
      ${commonParamDefs}
    ) {
      _id
    }
  }
`;

export const shape = `
  _id
  automationId
  type
  kind
  position
  size
  toArrow
  config
`;

const automationDetail = `
  query automationDetail($_id: String!) {
    automationDetail(_id: $_id) {
      _id
      name
      description
      status
      userId
      createdAt
      publishedAt
      modifiedAt
      modifiedBy
      shapes {
        ${shape}
      }
    }
  }
`;

export default {
  automations,
  automationDetail
};
