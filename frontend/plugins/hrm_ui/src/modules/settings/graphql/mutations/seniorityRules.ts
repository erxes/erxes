import { gql } from '@apollo/client';

const fields = `
  _id
  code
  name
  description
  valueType
  brackets {
    minMonths
    maxMonths
    value
  }
  status
`;

export const HRM_SENIORITY_RULES_CREATE = gql`
  mutation hrmSeniorityRulesCreate($doc: HrmSeniorityRuleInput!) {
    hrmSeniorityRulesCreate(doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_SENIORITY_RULES_UPDATE = gql`
  mutation hrmSeniorityRulesUpdate(
    $_id: String!
    $doc: HrmSeniorityRuleInput!
  ) {
    hrmSeniorityRulesUpdate(_id: $_id, doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_SENIORITY_RULES_ARCHIVE = gql`
  mutation hrmSeniorityRulesArchive($_id: String!) {
    hrmSeniorityRulesArchive(_id: $_id) {
      ${fields}
    }
  }
`;
