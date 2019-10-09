const commonVariables = `
  $stageId: String,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $hackStages: [String],
  $priority: String,
  $reach: Int,
  $impact: Int,
  $confidence: Int,
  $ease: Int,
  $attachments: [AttachmentInput]
`;

const commonParams = `
  stageId: $stageId,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  hackStages: $hackStages,
  priority: $priority,
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
  voteCount
  priority
  hackStages
  reach
  impact
  confidence
  ease
  scoringType
  modifiedAt
  modifiedBy
`;

const growthHacksAdd = `
  mutation growthHacksAdd($name: String!, ${commonVariables}) {
    growthHacksAdd(name: $name, ${commonParams}) {
      ${commonReturn}
    }
  }
`;

const growthHacksEdit = `
  mutation growthHacksEdit($_id: String!, $name: String, ${commonVariables}) {
    growthHacksEdit(name: $name, _id: $_id, ${commonParams}) {
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

const growthHacksVote = `
  mutation growthHacksVote($_id: String!, $isVote: Boolean!) {
    growthHacksVote(_id: $_id, isVote: $isVote) {
      ${commonReturn}
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
  growthHacksVote
};
