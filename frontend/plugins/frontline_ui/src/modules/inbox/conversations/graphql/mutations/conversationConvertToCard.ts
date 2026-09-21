import { gql } from '@apollo/client';

export const CONVERSATION_CONVERT_TO_CARD = gql`
  mutation ConversationConvertToCard(
    $_id: String!
    $type: String!
    $itemName: String
    $stageId: String
    $assignedUserIds: [String]
    $branchIds: [String]
    $departmentIds: [String]
    $description: String
    $customFieldsData: JSON
    $attachments: [AttachmentInput]
    $priority: String
    $tagIds: [String]
    $startDate: Date
    $closeDate: Date
  ) {
    conversationConvertToCard(
      _id: $_id
      type: $type
      itemName: $itemName
      stageId: $stageId
      assignedUserIds: $assignedUserIds
      branchIds: $branchIds
      departmentIds: $departmentIds
      description: $description
      customFieldsData: $customFieldsData
      attachments: $attachments
      priority: $priority
      tagIds: $tagIds
      startDate: $startDate
      closeDate: $closeDate
    )
  }
`;
