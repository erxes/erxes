import { gql } from '@apollo/client';

const fields = `
  _id
  code
  name
  description
  category
  score
  status
`;

export const HRM_SKILLS_CREATE = gql`
  mutation hrmSkillsCreate($doc: HrmSkillInput!) {
    hrmSkillsCreate(doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_SKILLS_UPDATE = gql`
  mutation hrmSkillsUpdate($_id: String!, $doc: HrmSkillInput!) {
    hrmSkillsUpdate(_id: $_id, doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_SKILLS_ARCHIVE = gql`
  mutation hrmSkillsArchive($_id: String!) {
    hrmSkillsArchive(_id: $_id) {
      ${fields}
    }
  }
`;
