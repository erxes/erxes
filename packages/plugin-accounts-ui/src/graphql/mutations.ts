import { mutations as accountMutations } from '@erxes/ui-accounts/src/graphql';

const accountAdd = accountMutations.accountAdd;

const accountEdit = accountMutations.accountEdit;

const accountsRemove = accountMutations.accountsRemove;

const accountCategoryAdd = accountMutations.accountCategoryAdd;
const accountCategoryEdit = accountMutations.accountCategoryEdit;

const accountCategoryRemove = `
  mutation accountCategoriesRemove($_id: String!) {
    accountCategoriesRemove(_id: $_id)
  }
`;

const accountsMerge = `
  mutation accountsMerge($accountIds: [String], $accountFields: JSON) {
    accountsMerge(accountIds: $accountIds, accountFields: $accountFields) {
      _id
    }
  }
`;

export default {
  accountAdd,
  accountEdit,
  accountsRemove,
  accountCategoryAdd,
  accountCategoryEdit,
  accountCategoryRemove,
  accountsMerge
};
