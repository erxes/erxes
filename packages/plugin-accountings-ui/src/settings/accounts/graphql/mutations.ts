import { accountFields, categoryFields } from "./queries";

const accountInputParamsDefs = `
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

const accountInputParams = `
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

const accountsAdd = `
  mutation accountsAdd(${accountInputParamsDefs}) {
    accountsAdd(${accountInputParams}) {
      ${accountFields}
    }
  }
`;

const accountsEdit = `
  mutation accountsEdit($_id: String!${accountInputParamsDefs}) {
    accountsEdit(_id: $_id, ${accountInputParams}) {
      ${accountFields}
    }
  }
`;

const accountsRemove = `
  mutation accountsRemove($accountIds: [String!]) {
    accountsRemove(accountIds: $accountIds)
  }
`;

const accountsMerge = `
  mutation accountsMerge($accountIds: [String], $accountFields: JSON) {
    accountsMerge(accountIds: $accountIds, accountFields: $accountFields) {
      ${accountFields}
    }
  }
`;

// categories

const categoryInputParamDefs = `
  $name: String!,
  $code: String!,
  $description: String,
  $parentId: String,
  $scopeBrandIds: [String],
  $status: String,
  $maskType: String,
  $mask: JSON
`;

const categoryInputParams = `
  name: $name,
  code: $code,
  description: $description,
  parentId: $parentId,
  scopeBrandIds: $scopeBrandIds,
  status: $status,
  maskType: $maskType,
  mask: $mask
`;

const accountCategoriesAdd = `
  mutation accountCategoriesAdd(${categoryInputParamDefs}) {
    accountCategoriesAdd(${categoryInputParams}) {
      ${categoryFields}
    }
  }
`;

const accountCategoriesEdit = `
  mutation accountCategoriesEdit($_id: String!, ${categoryInputParamDefs}) {
    accountCategoriesEdit(_id: $_id, ${categoryInputParams}) {
      ${categoryFields}
    }
  }
`;

const accountCategoriesRemove = `
  mutation accountCategoriesRemove($_id: String!) {
    accountCategoriesRemove(_id: $_id)
  }
`;

export default {
  accountsAdd,
  accountsEdit,
  accountsRemove,
  accountsMerge,
  accountCategoriesAdd,
  accountCategoriesEdit,
  accountCategoriesRemove
};
