import {
  commonFields,
  commonMutationParams,
  commonMutationVariables
} from 'modules/boards/graphql/mutations';
import { ticketFields } from './queries';

const ticketMutationVariables = `
  $source: String,
`;

const ticketMutationParams = `
  source: $source,
`;

const copyVariables = `$customerIds: [String], $companyIds: [String], $labelIds: [String]`;
const copyParams = `customerIds: $customerIds, companyIds: $companyIds, labelIds: $labelIds`;

const ticketsAdd = `
  mutation ticketsAdd($name: String!, ${copyVariables}, ${ticketMutationVariables}, ${commonMutationVariables}) {
    ticketsAdd(name: $name, ${copyParams}, ${ticketMutationParams}, ${commonMutationParams}) {
      ${ticketFields}
      ${commonFields}
    }
  }
`;

const ticketsEdit = `
  mutation ticketsEdit($_id: String!, $name: String, ${ticketMutationVariables}, ${commonMutationVariables}) {
    ticketsEdit(_id: $_id, name: $name, ${ticketMutationParams}, ${commonMutationParams}) {
      ${ticketFields}
      ${commonFields}
    }
  }
`;

const ticketsRemove = `
  mutation ticketsRemove($_id: String!) {
    ticketsRemove(_id: $_id) {
      _id
    }
  }
`;

const ticketsChange = `
  mutation ticketsChange($_id: String!, $destinationStageId: String!) {
    ticketsChange(_id: $_id, destinationStageId: $destinationStageId) {
      _id
    }
  }
`;

const ticketsUpdateOrder = `
  mutation ticketsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    ticketsUpdateOrder(stageId: $stageId, orders: $orders) {
      _id
    }
  }
`;

const ticketsWatch = `
  mutation ticketsWatch($_id: String!, $isAdd: Boolean!) {
    ticketsWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

const ticketsArchive = `
  mutation ticketsArchive($stageId: String!) {
    ticketsArchive(stageId: $stageId)
  }
`;

const ticketsCopy = `
  mutation ticketsCopy($_id: String!) {
    ticketsCopy(_id: $_id) {
      ${ticketFields}
    }
  }
`;

export default {
  ticketsAdd,
  ticketsEdit,
  ticketsRemove,
  ticketsChange,
  ticketsUpdateOrder,
  ticketsWatch,
  ticketsArchive,
  ticketsCopy
};
