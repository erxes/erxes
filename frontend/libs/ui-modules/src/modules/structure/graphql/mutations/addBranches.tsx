import { gql } from '@apollo/client';

export const BRANCHES_ADD = gql`
  mutation BranchesAdd($title: String, $code: String, $parentId: String) {
    branchesAdd(title: $title, code: $code, parentId: $parentId) {
      _id
      order
    }
  }
`;
