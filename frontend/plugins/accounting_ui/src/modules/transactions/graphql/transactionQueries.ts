import { gql } from '~/gql';

export const TRANSACTIONS_QUERY = gql(`
query accountingAccTransactions($ids: [String], $excludeIds: Boolean, $status: String, $mentionOwnerId: String, $mentionUserId: String, $searchValue: String, $number: String, $customerType: String, $customerId: String, $accountIds: [String], $accountKind: String, $accountExcludeIds: Boolean, $accountStatus: String, $accountCategoryId: String, $accountSearchValue: String, $accountBrand: String, $accountIsOutBalance: Boolean, $accountBranchId: String, $accountDepartmentId: String, $accountCurrency: String, $accountJournal: String, $brandId: String, $isOutBalance: Boolean, $branchId: String, $departmentId: String, $currency: String, $journal: String, $journals: [String], $statuses: [String], $createdUserId: String, $modifiedUserId: String, $startDate: Date, $endDate: Date, $startUpdatedDate: Date, $endUpdatedDate: Date, $startCreatedDate: Date, $endCreatedDate: Date, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
  accTransactionsMain(
    ids: $ids
    excludeIds: $excludeIds
    status: $status
    mentionOwnerId: $mentionOwnerId
    mentionUserId: $mentionUserId
    searchValue: $searchValue
    number: $number
    customerType: $customerType
    customerId: $customerId
    accountIds: $accountIds
    accountKind: $accountKind
    accountExcludeIds: $accountExcludeIds
    accountStatus: $accountStatus
    accountCategoryId: $accountCategoryId
    accountSearchValue: $accountSearchValue
    accountBrand: $accountBrand
    accountIsOutBalance: $accountIsOutBalance
    accountBranchId: $accountBranchId
    accountDepartmentId: $accountDepartmentId
    accountCurrency: $accountCurrency
    accountJournal: $accountJournal
    brandId: $brandId
    isOutBalance: $isOutBalance
    branchId: $branchId
    departmentId: $departmentId
    currency: $currency
    journal: $journal
    journals: $journals
    statuses: $statuses
    createdUserId: $createdUserId
    modifiedUserId: $modifiedUserId
    startDate: $startDate
    endDate: $endDate
    startUpdatedDate: $startUpdatedDate
    endUpdatedDate: $endUpdatedDate
    startCreatedDate: $startCreatedDate
    endCreatedDate: $endCreatedDate
    cursor: $cursor
    cursorMode: $cursorMode
    direction: $direction
    limit: $limit
  ) {
    list {
      _id
      ptrId
      parentId
      number
      ptrNumber
      ptrStatus
      createdAt
      updatedAt
      date
      description
      status
      mentionOwnerId
      mentionUserIds
      journal
      side
      relAccounts
      originId
      originType
      originSubId
      followInfos
      branchId
      departmentId
      customerType
      customerId
      assignedUserIds
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
      details {
        _id
        accountId
        transactionId
        branchId
        departmentId
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
        originId
        originType
        originSubId
        followInfos
        amount
        currencyAmount
        customRate
        assignedUserId
        productId
        fixedAssetId
        fixedAssetCategoryId
        fixedAssetCode
        fixedAssetName
        count
        unitPrice
        weight
        excludeVat
        excludeCtax
        account {
          _id
          code
          name
          currency
          kind
          journal
          extra {
            bank
            bankAccount
          }
        }
      }
      shortDetail {
        _id
        accountId
        transactionId
        branchId
        departmentId
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
        originId
        originType
        originSubId
        followInfos
        amount
        currencyAmount
        customRate
        assignedUserId
        productId
        fixedAssetId
        fixedAssetCategoryId
        fixedAssetCode
        fixedAssetName
        count
        unitPrice
        weight
        excludeVat
        excludeCtax
        account {
          _id
          code
          name
          currency
          extra {
            bank
            bankAccount
          }
        }
      }
      sumDt
      sumCt
      createdBy
      modifiedBy
      followTrs {
        _id
        ptrId
        parentId
        number
        ptrStatus
        details {
          _id
          accountId
          transactionId
          branchId
          departmentId
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
          originId
          originType
          originSubId
          followInfos
          amount
          currencyAmount
          customRate
          assignedUserId
          productId
          fixedAssetId
          fixedAssetCategoryId
          fixedAssetCode
          fixedAssetName
          count
          unitPrice
          weight
          excludeVat
          excludeCtax
        }
        shortDetail {
          _id
          accountId
          transactionId
          branchId
          departmentId
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
          originId
          originType
          originSubId
          followInfos
          amount
          currencyAmount
          customRate
          assignedUserId
          productId
          fixedAssetId
          fixedAssetCategoryId
          fixedAssetCode
          fixedAssetName
          count
          unitPrice
          weight
          excludeVat
          excludeCtax
        }
        sumDt
        sumCt
      }
      hasVat
      vatRowId
      afterVat
      isHandleVat
      vatAmount
      vatRow {
        _id
        number
        name
        percent
      }
      hasCtax
      ctaxRowId
      isHandleCtax
      ctaxAmount
      ctaxRow {
        _id
        number
        name
        percent
      }
      extraData
      contentType
      contentId
      permission
      ptrInfo
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);

export const TR_RECORDS_QUERY = gql(`
query accountingAccTrRecords($ids: [String], $excludeIds: Boolean, $status: String, $mentionOwnerId: String, $mentionUserId: String, $searchValue: String, $number: String, $customerType: String, $customerId: String, $accountIds: [String], $accountKind: String, $accountExcludeIds: Boolean, $accountStatus: String, $accountCategoryId: String, $accountSearchValue: String, $accountBrand: String, $accountIsOutBalance: Boolean, $accountBranchId: String, $accountDepartmentId: String, $accountCurrency: String, $accountJournal: String, $brandId: String, $isOutBalance: Boolean, $branchId: String, $departmentId: String, $currency: String, $journal: String, $journals: [String], $statuses: [String], $createdUserId: String, $modifiedUserId: String, $startDate: Date, $endDate: Date, $startUpdatedDate: Date, $endUpdatedDate: Date, $startCreatedDate: Date, $endCreatedDate: Date, $groupRule: [String], $folded: Boolean, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
  accTrRecordsMain(
    ids: $ids
    excludeIds: $excludeIds
    status: $status
    mentionOwnerId: $mentionOwnerId
    mentionUserId: $mentionUserId
    searchValue: $searchValue
    number: $number
    customerType: $customerType
    customerId: $customerId
    accountIds: $accountIds
    accountKind: $accountKind
    accountExcludeIds: $accountExcludeIds
    accountStatus: $accountStatus
    accountCategoryId: $accountCategoryId
    accountSearchValue: $accountSearchValue
    accountBrand: $accountBrand
    accountIsOutBalance: $accountIsOutBalance
    accountBranchId: $accountBranchId
    accountDepartmentId: $accountDepartmentId
    accountCurrency: $accountCurrency
    accountJournal: $accountJournal
    brandId: $brandId
    isOutBalance: $isOutBalance
    branchId: $branchId
    departmentId: $departmentId
    currency: $currency
    journal: $journal
    journals: $journals
    statuses: $statuses
    createdUserId: $createdUserId
    modifiedUserId: $modifiedUserId
    startDate: $startDate
    endDate: $endDate
    startUpdatedDate: $startUpdatedDate
    endUpdatedDate: $endUpdatedDate
    startCreatedDate: $startCreatedDate
    endCreatedDate: $endCreatedDate
    groupRule: $groupRule
    folded: $folded
    cursor: $cursor
    cursorMode: $cursorMode
    direction: $direction
    limit: $limit
  ) {
    list {
      _id
      ptrId
      parentId
      number
      ptrNumber
      ptrStatus
      createdAt
      updatedAt
      date
      description
      status
      mentionOwnerId
      mentionUserIds
      journal
      side
      relAccounts
      originId
      originType
      originSubId
      followInfos
      branchId
      departmentId
      customerType
      customerId
      assignedUserIds
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
      details {
        _id
        accountId
        transactionId
        branchId
        departmentId
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
        originId
        originType
        originSubId
        followInfos
        amount
        currencyAmount
        customRate
        assignedUserId
        productId
        fixedAssetId
        fixedAssetCategoryId
        fixedAssetCode
        fixedAssetName
        count
        unitPrice
        weight
        excludeVat
        excludeCtax
        account {
          _id
          code
          name
          currency
          kind
          journal
          extra {
            bank
            bankAccount
          }
        }
      }
      shortDetail {
        _id
        accountId
        transactionId
        branchId
        departmentId
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
        originId
        originType
        originSubId
        followInfos
        amount
        currencyAmount
        customRate
        assignedUserId
        productId
        fixedAssetId
        fixedAssetCategoryId
        fixedAssetCode
        fixedAssetName
        count
        unitPrice
        weight
        excludeVat
        excludeCtax
        account {
          _id
          code
          name
          currency
          extra {
            bank
            bankAccount
          }
        }
      }
      sumDt
      sumCt
      createdBy
      modifiedBy
      followTrs {
        _id
        ptrId
        parentId
        number
        ptrStatus
        details {
          _id
          accountId
          transactionId
          branchId
          departmentId
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
          originId
          originType
          originSubId
          followInfos
          amount
          currencyAmount
          customRate
          assignedUserId
          productId
          fixedAssetId
          fixedAssetCategoryId
          fixedAssetCode
          fixedAssetName
          count
          unitPrice
          weight
          excludeVat
          excludeCtax
        }
        shortDetail {
          _id
          accountId
          transactionId
          branchId
          departmentId
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
          originId
          originType
          originSubId
          followInfos
          amount
          currencyAmount
          customRate
          assignedUserId
          productId
          fixedAssetId
          fixedAssetCategoryId
          fixedAssetCode
          fixedAssetName
          count
          unitPrice
          weight
          excludeVat
          excludeCtax
        }
        sumDt
        sumCt
      }
      hasVat
      vatRowId
      afterVat
      isHandleVat
      vatAmount
      vatRow {
        _id
        number
        name
        percent
      }
      hasCtax
      ctaxRowId
      isHandleCtax
      ctaxAmount
      ctaxRow {
        _id
        number
        name
        percent
      }
      extraData
      contentType
      contentId
      permission
      trId
      detailInd
    }
    totalCount
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);
