const commonVariables = `
  $name: String!,
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput],
  $priority: String,
  $source: String,
`;

const commonParams = `
  name: $name,
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  priority: $priority,
  source: $source,
  attachments: $attachments
`;

const commonReturn = `
  _id
  name
  stageId
  companies {
    _id
    primaryName
  }
  customers {
    _id
    firstName
    primaryEmail
  }
  closeDate
  description
  assignedUsers {
    _id
    email
    details {
      fullName
      avatar
    }
  }
  priority
  source
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

const ticketsEditCompanies = `
  mutation ticketsEditCompanies($_id: String!, $companyIds: [String]!) {
    ticketsEditCompanies(_id: $_id, companyIds: $companyIds) {
      companies {
        _id
        primaryName
        website
      }
    }
  }
`;

const ticketsEditCustomers = `
  mutation ticketsEditCustomers($_id: String!, $customerIds: [String]!) {
    ticketsEditCustomers(_id: $_id, customerIds: $customerIds) {
      customers {
        _id
        firstName
        primaryEmail
      }
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

export default {
  ticketsAdd,
  ticketsEdit,
  ticketsEditCustomers,
  ticketsEditCompanies,
  ticketsRemove,
  ticketsChange,
  ticketsUpdateOrder,
  ticketsWatch
};
