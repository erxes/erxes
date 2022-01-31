import {
  commonDragParams,
  commonDragVariables,
  commonFields,
  commonMutationParams,
  commonMutationVariables
} from 'modules/boards/graphql/mutations';
import { dealFields } from './queries';

const dealMutationVariables = `
  $productsData: JSON,
  $paymentsData: JSON,
`;

const dealMutationParams = `
  productsData: $productsData,
  paymentsData: $paymentsData,
`;

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

const dealsAdd = `
  mutation dealsAdd($name: String!, ${copyVariables}, ${dealMutationVariables} ${commonMutationVariables}) {
    dealsAdd(name: $name, ${copyParams}, ${dealMutationParams}, ${commonMutationParams}) {
      ${dealFields}
      ${commonFields}
    }
  }
`;

const dealsEdit = `
  mutation dealsEdit($_id: String!, $name: String, ${dealMutationVariables}, ${commonMutationVariables}) {
    dealsEdit(_id: $_id, name: $name, ${dealMutationParams}, ${commonMutationParams}) {
      ${dealFields}
      ${commonFields}
    }
  }
`;

const dealsRemove = `
  mutation dealsRemove($_id: String!) {
    dealsRemove(_id: $_id) {
      _id
    }
  }
`;

const dealsChange = `
  mutation dealsChange(${commonDragVariables}) {
    dealsChange(${commonDragParams}) {
      _id
    }
  }
`;

const dealsWatch = `
  mutation dealsWatch($_id: String!, $isAdd: Boolean!) {
    dealsWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

const dealsArchive = `
  mutation dealsArchive($stageId: String!, $proccessId: String) {
    dealsArchive(stageId: $stageId, proccessId: $proccessId)
  }
`;

const dealsCopy = `
  mutation dealsCopy($_id: String!, $proccessId: String) {
    dealsCopy(_id: $_id, proccessId: $proccessId) {
      ${commonFields}
      ${dealFields}
    }
  }
`;

export default {
  dealsAdd,
  dealsEdit,
  dealsRemove,
  dealsChange,
  dealsWatch,
  dealsArchive,
  dealsCopy
};
