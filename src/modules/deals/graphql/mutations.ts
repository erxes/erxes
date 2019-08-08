const commonVariables = `
  $name: String!,
  $stageId: String,
  $productsData: JSON,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput]
`;

const commonParams = `
  name: $name,
  stageId: $stageId,
  productsData: $productsData,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
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
  products
  amount
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
  modifiedAt
  modifiedBy
`;

const dealsAdd = `
  mutation dealsAdd(${commonVariables}) {
    dealsAdd(${commonParams}) {
      ${commonReturn}
    }
  }
`;

const dealsEdit = `
  mutation dealsEdit($_id: String!, ${commonVariables}) {
    dealsEdit(_id: $_id, ${commonParams}) {
      ${commonReturn}
    }
  }
`;

const dealsEditCompanies = `
  mutation dealsEditCompanies($_id: String!, $companyIds: [String]!) {
    dealsEditCompanies(_id: $_id, companyIds: $companyIds) {
      companies {
        _id
        primaryName
        website
      }
    }
  }
`;

const dealsEditCustomers = `
  mutation dealsEditCustomers($_id: String!, $customerIds: [String]!) {
    dealsEditCustomers(_id: $_id, customerIds: $customerIds) {
      customers {
        _id
        firstName
        primaryEmail
      }
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
  mutation dealsChange($_id: String!, $destinationStageId: String!) {
    dealsChange(_id: $_id, destinationStageId: $destinationStageId) {
      _id
    }
  }
`;

const dealsUpdateOrder = `
  mutation dealsUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    dealsUpdateOrder(stageId: $stageId, orders: $orders) {
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

export default {
  dealsAdd,
  dealsEdit,
  dealsEditCustomers,
  dealsEditCompanies,
  dealsRemove,
  dealsChange,
  dealsUpdateOrder,
  dealsWatch
};
