import {
  commonDragParams,
  commonDragVariables,
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
  mutation ticketsChange(${commonDragVariables}) {
    ticketsChange(${commonDragParams}) {
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
  mutation ticketsArchive($stageId: String!, $proccessId: String) {
    ticketsArchive(stageId: $stageId, proccessId: $proccessId)
  }
`;

const ticketsCopy = `
  mutation ticketsCopy($_id: String!, $proccessId: String) {
    ticketsCopy(_id: $_id, proccessId: $proccessId) {
      ${commonFields}
      ${ticketFields}
    }
  }
`;

export default {
  ticketsAdd,
  ticketsEdit,
  ticketsRemove,
  ticketsChange,
  ticketsWatch,
  ticketsArchive,
  ticketsCopy
};
