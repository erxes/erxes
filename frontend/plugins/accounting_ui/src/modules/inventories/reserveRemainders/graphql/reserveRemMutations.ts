import { gql } from '@apollo/client';
import { reserveRemFields } from './reserveRemQueries';

export const RESERVE_REMS_ADD = gql`
  mutation ReserveRemsAdd(
    $departmentIds: [String]
    $branchIds: [String]
    $productCategoryId: String
    $productId: String
    $remainder: Float
  ) {
    reserveRemsAdd(
      departmentIds: $departmentIds
      branchIds: $branchIds
      productCategoryId: $productCategoryId
      productId: $productId
      remainder: $remainder
    ) {
      ${reserveRemFields}
    }
  }
`;

export const RESERVE_REM_EDIT = gql`
  mutation ReserveRemEdit(
    $_id: String!
    $branchId: String
    $departmentId: String
    $productId: String
    $uom: String
    $remainder: Float
  ) {
    reserveRemEdit(
      _id: $_id
      branchId: $branchId
      departmentId: $departmentId
      productId: $productId
      uom: $uom
      remainder: $remainder
    ) {
      ${reserveRemFields}
    }
  }
`;

export const RESERVE_REMS_REMOVE = gql`
  mutation ReserveRemsRemove($_ids: [String]) {
    reserveRemsRemove(_ids: $_ids)
  }
`;
