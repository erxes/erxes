const commonVariables = `
  $name: String!,
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $order: Int,
`;

const commonParams = `
  name: $name,
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  order: $order
`;

const commonReturn = `
  _id
  name
  stageId
  closeDate
  description
  modifiedAt
  modifiedBy
`;

const ticketsAdd = `
  mutation ticketsAdd(${commonVariables}) {
    ticketsAdd(${commonParams}) {
      ${commonReturn}
    }
  }
`;

const ticketsEdit = `
  mutation ticketsEdit($_id: String!, ${commonVariables}) {
    ticketsEdit(_id: $_id, ${commonParams}) {
      ${commonReturn}
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

export default {
  ticketsAdd,
  ticketsEdit,
  ticketsRemove
};
