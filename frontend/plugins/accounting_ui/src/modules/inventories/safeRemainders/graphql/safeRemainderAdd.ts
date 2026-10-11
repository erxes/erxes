import { gql } from '~/gql';

export const SAFE_REMAINDER_ADD = gql(`
mutation accountingSafeRemainderAdd($branchId: String, $departmentId: String, $date: Date, $description: String, $productCategoryId: String, $attachment: AttachmentInput, $filterField: String) {
  safeRemainderAdd(
    branchId: $branchId
    departmentId: $departmentId
    date: $date
    description: $description
    productCategoryId: $productCategoryId
    attachment: $attachment
    filterField: $filterField
  ) {
    _id
    createdAt
    createdBy
    modifiedAt
    modifiedBy
    date
    description
    status
    branchId
    departmentId
    productCategoryId
    branch {
      _id
      code
      title
    }
    department {
      _id
      code
      title
    }
    productCategory {
      _id
      code
      name
    }
    modifiedUser {
      _id
      details {
        avatar
        fullName
      }
    }
    incomeRule
    incomeTrId
    outRule
    outTrId
    saleRule
    saleTrId
    costIncreaseRule
    costDecreaseRule
    costIncreaseTrId
    costDecreaseTrId
  }
}
`);
