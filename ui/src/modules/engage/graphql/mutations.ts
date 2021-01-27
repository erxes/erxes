import { engageDetailFields } from './queries';

const setPause = `
  mutation setPause($_id: String!) {
    engageMessageSetPause(_id: $_id) {
      _id
    }
  }
`;

const setLive = `
  mutation setLive($_id: String!) {
    engageMessageSetLive(_id: $_id) {
      _id
    }
  }
`;

const setLiveManual = `
  mutation setLiveManual($_id: String!) {
    engageMessageSetLiveManual(_id: $_id) {
      _id
    }
  }
`;

const engagesUpdateConfigs = `
  mutation engagesUpdateConfigs($configsMap: JSON!) {
    engagesUpdateConfigs(configsMap: $configsMap)
  }
`;

const sendTestEmail = `
  mutation engageMessageSendTestEmail($from: String!, $to: String!, $content: String!, $title: String!) {
    engageMessageSendTestEmail(from: $from, to: $to, content: $content, title: $title)
  }
`;

const commonVariables = `
  $title: String!,
  $kind: String!,
  $method: String!,
  $fromUserId: String,
  $isDraft: Boolean,
  $isLive: Boolean,
  $stopDate: Date,
  $segmentIds: [String],
  $brandIds: [String],
  $customerIds: [String],
  $tagIds: [String],
  $email: EngageMessageEmail,
  $scheduleDate: EngageScheduleDateInput,
  $messenger: EngageMessageMessenger,
  $shortMessage: EngageMessageSmsInput,
`;

const commonParams = `
  title: $title,
  kind: $kind,
  method: $method,
  fromUserId: $fromUserId,
  isDraft: $isDraft,
  isLive: $isLive,
  stopDate: $stopDate,
  segmentIds: $segmentIds,
  tagIds: $tagIds,
  brandIds: $brandIds,
  customerIds: $customerIds,
  email: $email,
  messenger: $messenger,
  scheduleDate: $scheduleDate,
  shortMessage: $shortMessage,
`;

const messagesAdd = `
  mutation engageMessageAdd(${commonVariables}) {
    engageMessageAdd(${commonParams}) {
      _id
      ${engageDetailFields}
    }
  }
`;

const messagesEdit = `
  mutation engageMessageEdit($_id: String!, ${commonVariables}) {
    engageMessageEdit(_id: $_id, ${commonParams}) {
      _id
      ${engageDetailFields}
    }
  }
`;

const messageRemove = `
  mutation engageMessageRemove($_id: String!) {
    engageMessageRemove(_id: $_id) {
      _id
    }
  }
`;

const verifyEmail = `
  mutation engageMessageVerifyEmail($email: String!) {
    engageMessageVerifyEmail(email: $email)
  }
`;

const removeVerifiedEmail = `
  mutation engageMessageRemoveVerifiedEmail($email: String!) {
    engageMessageRemoveVerifiedEmail(email: $email)
  }
`;

const segmentsAdd = `
  mutation segmentsAdd(
    $name: String!,
    $description: String,
    $subOf: String,
    $color: String,
    $conditions: [SegmentCondition],
  ) {

    segmentsAdd(
      contentType: "customer",
      name: $name,
      description: $description,
      subOf: $subOf,
      color: $color,
      conditions: $conditions,
    ) {
      _id
    }
  }
`;

const engageMessageCopy = `
  mutation engageMessageCopy($_id: String!) {
    engageMessageCopy(_id: $_id) {
      _id
    }
  }
`;

export default {
  setPause,
  setLive,
  setLiveManual,
  messageRemove,
  messagesAdd,
  messagesEdit,
  engagesUpdateConfigs,
  segmentsAdd,
  removeVerifiedEmail,
  verifyEmail,
  sendTestEmail,
  engageMessageCopy
};
