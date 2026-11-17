import { gql } from '@apollo/client';
import { COMMON_USER_FIELDS } from './graphqlConstants';

export const AUTOMATION_VERSIONS = gql`
  query AutomationVersions($automationId: String!) {
    automationVersions(automationId: $automationId) {
      _id
      automationId
      version
      changedNodeIds
      note
      createdAt
      createdUser {
        ${COMMON_USER_FIELDS}
      }
    }
  }
`;

export const AUTOMATION_VERSION_DETAIL = gql`
  query AutomationVersionDetail($_id: String!) {
    automationVersionDetail(_id: $_id) {
      _id
      automationId
      version
      triggers
      actions
      workflows
    }
  }
`;
