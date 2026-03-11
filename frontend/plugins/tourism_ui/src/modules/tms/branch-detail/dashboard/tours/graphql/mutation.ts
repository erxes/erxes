import { gql } from '@apollo/client';

export const CREATE_TOUR = gql`
  mutation BmsTourAdd(
    $branchId: String
    $name: String
    $content: String
    $date_status: DATE_STATUS!
  ) {
    bmsTourAdd(
      branchId: $branchId
      name: $name
      content: $content
      date_status: $date_status
    ) {
      _id
      name
      content
      branchId
      createdAt
    }
  }
`;

export const REMOVE_TOUR = gql`
  mutation BmsTourRemove($ids: [String]) {
    bmsTourRemove(ids: $ids)
  }
`;
