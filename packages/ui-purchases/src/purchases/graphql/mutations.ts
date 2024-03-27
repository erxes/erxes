import {
  commonDragParams,
  commonDragVariables,
  commonFields,
  commonMutationParams,
  commonMutationVariables
} from '../../boards/graphql/mutations';
import { purchaseFields } from './queries';

const purchaseMutationVariables = `
  $productsData: JSON,
  $paymentsData: JSON,
  $expensesData: JSON,
`;

const purchaseMutationParams = `
  productsData: $productsData,
  paymentsData: $paymentsData,
  expensesData: $expensesData,
`;

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

const purchasesAdd = `
  mutation purchasesAdd($name: String!, ${copyVariables}, ${purchaseMutationVariables} ${commonMutationVariables}) {
    purchasesAdd(name: $name, ${copyParams}, ${purchaseMutationParams}, ${commonMutationParams}) {
      ${purchaseFields}
      ${commonFields}
    }
  }
`;

const purchasesEdit = `
  mutation purchasesEdit($_id: String!, $name: String, ${purchaseMutationVariables}, ${commonMutationVariables}) {
    purchasesEdit(_id: $_id, name: $name, ${purchaseMutationParams}, ${commonMutationParams}) {
      ${purchaseFields}
      ${commonFields}
    }
  }
`;

const purchasesRemove = `
  mutation purchasesRemove($_id: String!) {
    purchasesRemove(_id: $_id) {
      _id
    }
  }
`;

const purchasesChange = `
  mutation purchasesChange(${commonDragVariables}) {
    purchasesChange(${commonDragParams}) {
      _id
    }
  }
`;

const purchasesWatch = `
  mutation purchasesWatch($_id: String!, $isAdd: Boolean!) {
    purchasesWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

const purchasesArchive = `
  mutation purchasesArchive($stageId: String!, $proccessId: String) {
    purchasesArchive(stageId: $stageId, proccessId: $proccessId)
  }
`;

const purchasesCopy = `
  mutation purchasesCopy($_id: String!, $proccessId: String) {
    purchasesCopy(_id: $_id, proccessId: $proccessId) {
      ${commonFields}
      ${purchaseFields}
    }
  }
`;

const confirmLoyalties = `
  mutation ConfirmLoyalties($checkInfo: JSON) {
    confirmLoyalties(checkInfo: $checkInfo)
  }
`;

export default {
  purchasesAdd,
  purchasesEdit,
  purchasesRemove,
  purchasesChange,
  purchasesWatch,
  purchasesArchive,
  purchasesCopy,
  confirmLoyalties
};
