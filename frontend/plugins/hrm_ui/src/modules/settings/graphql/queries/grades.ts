import { gql } from '@apollo/client';

export const HRM_GRADES = gql`
  query hrmGrades(
    $status: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    hrmGrades(
      status: $status
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      _id
      code
      name
      description
      rank
      baseSalary
      allowanceAmount
      allowanceRate
      status
    }
  }
`;

export const HRM_GRADES_COUNT = gql`
  query hrmGradesCount($status: String, $searchValue: String) {
    hrmGradesCount(status: $status, searchValue: $searchValue)
  }
`;
