import gql from 'graphql-tag';

export const templatesQuery = gql`
  query operationTemplates($teamId: String) {
    operationTemplates(teamId: $teamId) {
      _id
      name
      defaults
      teamId
      createdAt
      updatedAt
      createdBy
    }
  }
`;

export const templateDetailQuery = gql`
  query operationTemplateDetail($_id: String!) {
    operationTemplateDetail(_id: $_id) {
      _id
      name
      defaults
      teamId
      createdAt
      updatedAt
    }
  }
`;
