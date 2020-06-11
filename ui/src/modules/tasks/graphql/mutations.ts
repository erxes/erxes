import {
  commonFields,
  commonMutationParams,
  commonMutationVariables
} from 'modules/boards/graphql/mutations';

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

const tasksAdd = `
  mutation tasksAdd($name: String!, ${copyVariables}, ${commonMutationVariables}) {
    tasksAdd(name: $name, ${copyParams}, ${commonMutationParams}) {
      ${commonFields}
    }
  }
`;

const tasksEdit = `
  mutation tasksEdit($_id: String!, $name: String, ${commonMutationVariables}) {
    tasksEdit(_id: $_id, name: $name, ${commonMutationParams}) {
      ${commonFields}
    }
  }
`;

const tasksRemove = `
  mutation tasksRemove($_id: String!) {
    tasksRemove(_id: $_id) {
      _id
    }
  }
`;

const tasksChange = `
  mutation tasksChange($_id: String!, $destinationStageId: String!, $order: Float) {
    tasksChange(_id: $_id, destinationStageId: $destinationStageId, order: $order) {
      _id
    }
  }
`;

const tasksWatch = `
  mutation tasksWatch($_id: String!, $isAdd: Boolean!) {
    tasksWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

const tasksArchive = `
  mutation tasksArchive($stageId: String!) {
    tasksArchive(stageId: $stageId)
  }
`;

const tasksCopy = `
  mutation tasksCopy($_id: String!) {
    tasksCopy(_id: $_id) {
      ${commonFields}
    }
  }
`;

export default {
  tasksAdd,
  tasksEdit,
  tasksRemove,
  tasksChange,
  tasksWatch,
  tasksArchive,
  tasksCopy
};
