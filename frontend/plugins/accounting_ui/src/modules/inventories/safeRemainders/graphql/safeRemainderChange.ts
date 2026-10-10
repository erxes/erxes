import { gql } from '~/gql';

export const SAFE_REMAINDER_RECALC = gql(`
mutation accountingSafeRemainderReCalc($_id: String!) {
  safeRemainderReCalc(_id: $_id)
}
`);
export const SAFE_REMAINDER_SUBMIT = gql(`
mutation accountingSafeRemainderSubmit($_id: String!) {
  safeRemainderSubmit(_id: $_id) {
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
export const SAFE_REMAINDER_CANCEL = gql(`
mutation accountingSafeRemainderCancel($_id: String!) {
  safeRemainderCancel(_id: $_id) {
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
export const SAFE_REMAINDER_DO_TR = gql(`
mutation accountingSafeRemainderDoTr($_id: String!) {
  safeRemainderDoTr(_id: $_id) {
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
export const SAFE_REMAINDER_UNDO_TR = gql(`
mutation accountingSafeRemainderUndoTr($_id: String!) {
  safeRemainderUndoTr(_id: $_id) {
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

export const SAFE_REMAINDER_EDIT = gql(`
mutation accountingSafeRemainderEdit($_id: String!, $description: String, $incomeRule: JSON, $outRule: JSON, $saleRule: JSON, $costIncreaseRule: JSON, $costDecreaseRule: JSON) {
  safeRemainderEdit(
    _id: $_id
    description: $description
    incomeRule: $incomeRule
    outRule: $outRule
    saleRule: $saleRule
    costIncreaseRule: $costIncreaseRule
    costDecreaseRule: $costDecreaseRule
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

// items:
export const SAFE_REMAINDER_ITEM_EDIT = gql(`
mutation accountingSafeRemainderItemEdit($_id: String!, $status: String, $remainder: Float, $trInfo: JSON) {
  safeRemainderItemEdit(
    _id: $_id
    status: $status
    remainder: $remainder
    trInfo: $trInfo
  ) {
    _id
    branchId
    departmentId
    preCount
    count
    status
    remainderId
    createdAt
    createdBy
    modifiedAt
    modifiedBy
    order
    product {
      _id
      code
      name
    }
    productId
    uom
    trInfo {
      activeCost
      unitCost
      isCostExplicit
      lastIncomePrice
      isSale
      unitPrice
    }
  }
}
`);

export const SAFE_REMAINDER_ITEMS_REMOVE = gql(`
mutation accountingSafeRemainderItemsRemove($ids: [String!]!) {
  safeRemainderItemsRemove(ids: $ids)
}
`);

export const SAFE_REMAINDER_ITEMS_BULK_EDIT = gql(`
mutation accountingSafeRemainderItemsBulkEdit($safeRemainderId: String!, $productsData: JSON!, $duplicateRule: String) {
  safeRemainderItemsBulkEdit(
    safeRemainderId: $safeRemainderId
    productsData: $productsData
    duplicateRule: $duplicateRule
  )
}
`);
