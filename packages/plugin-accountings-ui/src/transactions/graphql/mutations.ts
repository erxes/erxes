import { commonTransactionFields } from "./queries";

const mainTrInputParamDefs = `
  $code: String,
  $name: String,
  $categoryId: String,
  $parentId: String,
  $currency: String,
  $kind: String,
  $journal: String,
  $description: String,
  $branchId: String,
  $departmentId: String,
  $isOutBalance: Boolean,
  $scopeBrandIds: [String]
`;

const mainTrInputParams = `
  code: $code,
  name: $name,
  categoryId: $categoryId,
  parentId: $parentId,
  currency: $currency,
  kind: $kind,
  journal: $journal,
  description: $description,
  branchId: $branchId,
  departmentId: $departmentId,
  isOutBalance: $isOutBalance,
  scopeBrandIds: $scopeBrandIds
`;

const currencyParamDefs = `
  $currencyAmount: Float
  $customRate: Float
  $currencyDiffAccountId: String
`;

const currencyParams = `
  currencyAmount: $currencyAmount
  customRate: $customRate
  currencyDiffAccountId: $currencyDiffAccountId
`;

const taxParamDefs = `
  $hasVat: Boolean,
  $vatRowId: String,
  $afterVat: Boolean,
  $afterVatAccountId: String,
  $isHandleVat: Boolean,
  $vatAmount: Float,

  $hasCtax: Boolean,
  $ctaxRowId: String,
  $isHandleCtax: Boolean,
  $ctaxAmount: Float,
`;

const taxParams = `
  hasVat: $hasVat,
  vatRowId: $vatRowId,
  afterVat: $afterVat,
  afterVatAccountId: $afterVatAccountId,
  isHandleVat: $isHandleVat,
  vatAmount: $vatAmount,

  hasCtax: $hasCtax,
  ctaxRowId: $ctaxRowId,
  isHandleCtax: $isHandleCtax,
  ctaxAmount: $ctaxAmount,
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
  mutation cashTrAdd(${mainTrInputParamDefs}, ${currencyParamDefs}, ${taxParamDefs}) {
    cashTrAdd(${mainTrInputParams}, ${currencyParams}, ${taxParams}) {
      ${commonTransactionFields}
    }
  }
`;

const cashTrEdit = `
  mutation cashTrEdit($_id: String!${mainTrInputParamDefs}, ${currencyParamDefs}, ${taxParamDefs}) {
    cashTrEdit(_id: $_id, ${mainTrInputParams}, ${currencyParams}, ${taxParams}) {
      ${commonTransactionFields}
    }
  }
`;

const fundTrAdd = `
  mutation fundTrAdd(${mainTrInputParamDefs}, ${currencyParamDefs}, ${taxParamDefs}) {
    fundTrAdd(${mainTrInputParams}, ${currencyParams}, ${taxParams}) {
      ${commonTransactionFields}
    }
  }
`;

const fundTrEdit = `
  mutation fundTrEdit($_id: String!${mainTrInputParamDefs}, ${currencyParamDefs}, ${taxParamDefs}) {
    fundTrEdit(_id: $_id, ${mainTrInputParams}, ${currencyParams}, ${taxParams}) {
      ${commonTransactionFields}
    }
  }
`;

const debtTrAdd = `
  mutation debtTrAdd(${mainTrInputParamDefs}, ${currencyParamDefs}, ${taxParamDefs}) {
    debtTrAdd(${mainTrInputParams}, ${currencyParams}, ${taxParams}) {
      ${commonTransactionFields}
    }
  }
`;

const debtTrEdit = `
  mutation debtTrEdit($_id: String!${mainTrInputParamDefs}, ${currencyParamDefs}, ${taxParamDefs}) {
    debtTrEdit(_id: $_id, ${mainTrInputParams}, ${currencyParams}, ${taxParams}) {
      ${commonTransactionFields}
    }
  }
`;

export default {
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
