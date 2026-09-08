import { gql } from '@apollo/client';

export const HRM_SKILLS = gql`
  query hrmSkills(
    $status: String
    $category: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    hrmSkills(
      status: $status
      category: $category
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      _id
      code
      name
      description
      category
      score
      status
    }
  }
`;

export const HRM_SKILLS_COUNT = gql`
  query hrmSkillsCount(
    $status: String
    $category: String
    $searchValue: String
  ) {
    hrmSkillsCount(
      status: $status
      category: $category
      searchValue: $searchValue
    )
  }
`;
