import {
  commonDragParams,
  commonDragVariables,
  commonFields,
  commonMutationParams,
  commonMutationVariables
} from "../../boards/graphql/mutations";

const copyVariables = `$companyIds: [String], $customerIds: [String], $labelIds: [String]`;
const copyParams = `companyIds: $companyIds, customerIds: $customerIds, labelIds: $labelIds`;

const ticketsAdd = `
  mutation ticketsAdd($name: String!, ${copyVariables}, ${commonMutationVariables}) {
    ticketsAdd(name: $name, ${copyParams}, ${commonMutationParams}) {
      ${commonFields}
    }
  }
`;

const ticketsEdit = `
  mutation ticketsEdit($_id: String!, $name: String, ${commonMutationVariables}) {
    ticketsEdit(_id: $_id, name: $name, ${commonMutationParams}) {
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
