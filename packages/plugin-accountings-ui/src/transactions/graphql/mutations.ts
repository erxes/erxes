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
  mutation mainTrAdd(${mainTrInputParamDefs}) {
    mainTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const mainTrEdit = `
  mutation mainTrEdit($_id: String!${mainTrInputParamDefs}) {
    mainTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const mainTrRemove = `
  mutation mainTrRemove($_id: String!) {
    mainTrRemove(_id: $_id)
  }
`;

const ptrRemove = `
  mutation ptrRemove($_id: String!) {
    ptrRemove(_id: $_id)
  }
`;

const transactionsLink = `
  mutation transactionsLink($trIds: [String], $ptrId: String) {
    transactionsLink(trIds: $trIds, ptrId: $ptrId)
  }
`;

const cashTrAdd = `
  mutation cashTrAdd(${mainTrInputParamDefs}) {
    cashTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const cashTrEdit = `
  mutation cashTrEdit($_id: String!${mainTrInputParamDefs}) {
    cashTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const fundTrAdd = `
  mutation fundTrAdd(${mainTrInputParamDefs}) {
    fundTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const fundTrEdit = `
  mutation fundTrEdit($_id: String!${mainTrInputParamDefs}) {
    fundTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const debtTrAdd = `
  mutation debtTrAdd(${mainTrInputParamDefs}) {
    debtTrAdd(${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const debtTrEdit = `
  mutation debtTrEdit($_id: String!, ${mainTrInputParamDefs}) {
    debtTrEdit(_id: $_id, ${mainTrInputParams}) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsCreate = `
  mutation transactionsCreate($trDocs: [TransactionInput]) {
    transactionsCreate(trDocs: $trDocs) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsUpdate = `
  mutation transactionsUpdate($parentId: String!, $trDocs: [TransactionInput]) {
    transactionsUpdate(parentId: $parentId, trDocs: $trDocs) {
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
