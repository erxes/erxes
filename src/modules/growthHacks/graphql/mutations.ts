const commonVariables = `
  $name: String,
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $companyIds: [String],
  $customerIds: [String],
  $assignedUserIds: [String],
  $order: Int,
  $hackDescription: String,
  $formFields: JSON,
  $goal: String,
  $hackStages: [String],
  $priority: String,
  $reach: Int,
  $impact: Int,
  $confidence: Int,
  $ease: Int,
  $attachments: [AttachmentInput]
`;

const commonParams = `
  name: $name,
  stageId: $stageId,
  companyIds: $companyIds,
  customerIds: $customerIds,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  hackDescription: $hackDescription,
  goal: $goal,
  hackStages: $hackStages,
  priority: $priority,
  formFields: $formFields,
  attachments: $attachments,
  reach: $reach,
  impact: $impact,
  confidence: $confidence,
  ease: $ease
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
  hackDescription
  reach
  impact
  confidence
  ease
  goal
  modifiedAt
  modifiedBy
`;

const growthHacksAdd = `
  mutation growthHacksAdd(${commonVariables}) {
    growthHacksAdd(${commonParams}) {
      ${commonReturn}
    }
  }
`;

const growthHacksEdit = `
  mutation growthHacksEdit($_id: String!, ${commonVariables}) {
    growthHacksEdit(_id: $_id, ${commonParams}) {
      ${commonReturn}
    }
  }
`;

const growthHacksRemove = `
  mutation growthHacksRemove($_id: String!) {
    growthHacksRemove(_id: $_id) {
      _id
    }
  }
`;

const growthHacksChange = `
  mutation growthHacksChange($_id: String!, $destinationStageId: String!) {
    growthHacksChange(_id: $_id, destinationStageId: $destinationStageId) {
      _id
    }
  }
`;

const growthHacksSaveFormFields = `
  mutation growthHacksSaveFormFields($_id: String!, $stageId: String!, $formFields: JSON!) {
    growthHacksSaveFormFields(_id: $_id, stageId: $stageId, formFields: $formFields)
  }
`;

const growthHacksUpdateOrder = `
  mutation growthHacksUpdateOrder($stageId: String!, $orders: [OrderItem]) {
    growthHacksUpdateOrder(stageId: $stageId, orders: $orders) {
      _id
    }
  }
`;

const growthHacksWatch = `
  mutation growthHacksWatch($_id: String!, $isAdd: Boolean!) {
    growthHacksWatch(_id: $_id, isAdd: $isAdd) {
      _id
      isWatched
    }
  }
`;

export default {
  growthHacksAdd,
  growthHacksEdit,
  growthHacksRemove,
  growthHacksChange,
  growthHacksUpdateOrder,
  growthHacksWatch,
  growthHacksSaveFormFields
};
