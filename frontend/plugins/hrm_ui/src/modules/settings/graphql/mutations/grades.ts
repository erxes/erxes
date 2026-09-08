import { gql } from '@apollo/client';

const fields = `
  _id
  code
  name
  description
  rank
  baseSalary
  allowanceAmount
  allowanceRate
  status
`;

export const HRM_GRADES_CREATE = gql`
  mutation hrmGradesCreate($doc: HrmGradeInput!) {
    hrmGradesCreate(doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_GRADES_UPDATE = gql`
  mutation hrmGradesUpdate($_id: String!, $doc: HrmGradeInput!) {
    hrmGradesUpdate(_id: $_id, doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_GRADES_ARCHIVE = gql`
  mutation hrmGradesArchive($_id: String!) {
    hrmGradesArchive(_id: $_id) {
      ${fields}
    }
  }
`;
