import { growthHackFields } from './queries';

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
  $status: String,
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
  status: $status,
  ease: $ease
`;

const growthHacksAdd = `
  mutation growthHacksAdd($name: String!, ${commonVariables}, $labelIds: [String]) {
    growthHacksAdd(name: $name, ${commonParams}, labelIds: $labelIds) {
      ${growthHackFields}
    }
  }
`;

const growthHacksEdit = `
  mutation growthHacksEdit($_id: String!, $name: String, ${commonVariables}) {
    growthHacksEdit(name: $name, _id: $_id, ${commonParams}) {
      ${growthHackFields}
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
      ${growthHackFields}
    }
  }
`;

const growthHacksArchive = `
  mutation growthHacksArchive($stageId: String!) {
    growthHacksArchive(stageId: $stageId)
  }
`;

const growthHacksCopy = `
  mutation growthHacksCopy($_id: String!) {
    growthHacksCopy(_id: $_id) {
      ${growthHackFields}
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
  growthHacksVote,
  growthHacksArchive,
  growthHacksCopy
};
