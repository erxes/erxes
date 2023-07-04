const accountParamsDef = `
  $name: String,
  $type: String,
  $categoryId: String,
  $code: String
  $customFieldsData: JSON,
  $currency:Float,
  $isBalance: Boolean,
  $closePercent: Float,
  $journal: String,
`;

const accountCategoryParamsDef = `
  $name: String!,
  $code: String!,
  $parentId: String,
  $status: String,
`;

const accountParams = `
  name: $name,
  type: $type,
  categoryId: $categoryId,
  code: $code,
  customFieldsData: $customFieldsData,
  currency:$currency,
  isBalance: $isBalance,
  closePercent: $closePercent,
  journal: $journal,
`;

const accountCategoryParams = `
  name: $name,
  code: $code,
  parentId: $parentId,
  status: $status,
`;

const accountAdd = `
  mutation accountsAdd(${accountParamsDef}) {
    accountsAdd(${accountParams}) {
      _id
    }
  }
`;

const accountEdit = `
  mutation accountsEdit($_id: String!, ${accountParamsDef}) {
    accountsEdit(_id: $_id, ${accountParams}) {
      _id
    }
  }
`;

const accountCategoryAdd = `
  mutation accountCategoriesAdd(${accountCategoryParamsDef}) {
    accountCategoriesAdd(${accountCategoryParams}) {
      _id
    }
  }
`;

const accountCategoryEdit = `
  mutation accountCategoriesEdit($_id: String!, ${accountCategoryParamsDef}) {
    accountCategoriesEdit(_id: $_id, ${accountCategoryParams}) {
      _id
    }
  }
`;

const accountsRemove = `
  mutation accountsRemove($accountIds: [String!]) {
    accountsRemove(accountIds: $accountIds)
  }
`;

export default {
  accountAdd,
  accountEdit,
  accountsRemove,
  accountCategoryAdd,
  accountCategoryEdit
};
