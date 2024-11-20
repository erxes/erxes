import { commonTransactionFields } from "./queries";

const mainTrInputParamDefs = `
  $ptrId: String,
  $parentId: String,
  $number: String,

  $date: Date,
  $description: String,
  $journal: String,
  $followInfos: JSON,

  $branchId: String,
  $departmentId: String,
  $customerType: String,
  $customerId: String,
  $assignedUserIds: [String],

  $hasVat: Boolean,
  $vatRowId: String,
  $afterVat: Boolean,
  $isHandleVat: Boolean,
  $vatAmount: Float,

  $hasCtax: Boolean,
  $ctaxRowId: String,
  $isHandleCtax: Boolean,
  $ctaxAmount: Float,

  $details: CommonTrDetailInput,
`;

const mainTrInputParams = `
  ptrId: $ptrId,
  parentId: $parentId,
  number: $number,

  date: $date,
  description: $description,
  journal: $journal,
  followInfos: $followInfos,

  branchId: $branchId,
  departmentId: $departmentId,
  customerType: $customerType,
  customerId: $customerId,
  assignedUserIds: $assignedUserIds,

  hasVat: $hasVat,
  vatRowId: $vatRowId,
  afterVat: $afterVat,
  isHandleVat: $isHandleVat,
  vatAmount: $vatAmount,

  hasCtax: $hasCtax,
  ctaxRowId: $ctaxRowId,
  isHandleCtax: $isHandleCtax,
  ctaxAmount: $ctaxAmount,

  details: $details,
`;

const mainTrAdd = `
  mutation accMainTrAdd(${mainTrInputParamDefs}) {
    accMainTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const mainTrEdit = `
  mutation accMainTrEdit($_id: String!${mainTrInputParamDefs}) {
    accMainTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const mainTrRemove = `
  mutation accMainTrRemove($_id: String!) {
    accMainTrRemove(_id: $_id)
  }
`;

const ptrRemove = `
  mutation accPtrRemove($_id: String!) {
    accPtrRemove(_id: $_id)
  }
`;

const transactionsLink = `
  mutation accTransactionsLink($trIds: [String], $ptrId: String) {
    accTransactionsLink(trIds: $trIds, ptrId: $ptrId)
  }
`;

const cashTrAdd = `
  mutation accCashTrAdd(${mainTrInputParamDefs}) {
    accCashTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const cashTrEdit = `
  mutation accCashTrEdit($_id: String!${mainTrInputParamDefs}) {
    accCashTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const fundTrAdd = `
  mutation accFundTrAdd(${mainTrInputParamDefs}) {
    accFundTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const fundTrEdit = `
  mutation accFundTrEdit($_id: String!${mainTrInputParamDefs}) {
    accFundTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const debtTrAdd = `
  mutation accDebtTrAdd(${mainTrInputParamDefs}) {
    accDebtTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const debtTrEdit = `
  mutation accDebtTrEdit($_id: String!, ${mainTrInputParamDefs}) {
    accDebtTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsCreate = `
  mutation accTransactionsCreate($trDocs: [TransactionInput]) {
    accTransactionsCreate(trDocs: $trDocs) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsUpdate = `
  mutation accTransactionsUpdate($parentId: String!, $trDocs: [TransactionInput]) {
    accTransactionsUpdate(parentId: $parentId, trDocs: $trDocs) {
      ${commonTransactionFields}
    }
  }
`;

export default {
  transactionsCreate,
  transactionsUpdate,
  mainTrAdd,
  mainTrEdit,
  mainTrRemove,
  ptrRemove,
  transactionsLink,
  cashTrAdd,
  cashTrEdit,
  fundTrAdd,
  fundTrEdit,
  debtTrAdd,
  debtTrEdit,
};
