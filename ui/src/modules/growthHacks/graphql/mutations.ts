import {
  commonDragParams,
  commonDragVariables
} from 'modules/boards/graphql/mutations';
import { growthHackFields } from './queries';

const commonVariables = `
  $proccessId: String,
  $aboveItemId: String,
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
  proccessId: $proccessId,
  aboveItemId: $aboveItemId,
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
  mutation growthHacksChange(${commonDragVariables}) {
    growthHacksChange(${commonDragParams}) {
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
  mutation growthHacksArchive($stageId: String!, $proccessId: String) {
    growthHacksArchive(stageId: $stageId, proccessId: $proccessId)
  }
`;

const growthHacksCopy = `
  mutation growthHacksCopy($_id: String!, $proccessId: String) {
    growthHacksCopy(_id: $_id, proccessId: $proccessId) {
      ${growthHackFields}
    }
  }
`;

export default {
  growthHacksAdd,
  growthHacksEdit,
  growthHacksRemove,
  growthHacksChange,
  growthHacksWatch,
  growthHacksVote,
  growthHacksArchive,
  growthHacksCopy
};
