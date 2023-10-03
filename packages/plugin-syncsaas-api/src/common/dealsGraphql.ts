import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

export const commonMutationVariables = `
  $companyIds: [String],
  $customerIds: [String],
  $labelIds: [String],
  $productsData: JSON,
  $paymentsData: JSON,
  $parentId: String,
  $proccessId: String,
  $aboveItemId: String,
  $stageId: String,
  $startDate: Date,
  $closeDate: Date,
  $description: String,
  $assignedUserIds: [String],
  $order: Int,
  $attachments: [AttachmentInput],
  $reminderMinute: Int,
  $isComplete: Boolean,
  $status: String,
  $priority: String,
  $sourceConversationIds: [String],
  $customFieldsData: JSON,
  $tagIds: [String]
  $branchIds:[String],
  $departmentIds:[String]
`;

const dealFields = `
  products
  productsData
  paymentsData
  unUsedAmount
  amount
`;

const commonMutationParams = `
  productsData: $productsData,
  paymentsData: $paymentsData,
  companyIds: $companyIds,
  customerIds: $customerIds,
  labelIds: $labelIds,
  parentId: $parentId,
  proccessId: $proccessId,
  aboveItemId: $aboveItemId,
  stageId: $stageId,
  startDate: $startDate,
  closeDate: $closeDate,
  description: $description,
  assignedUserIds: $assignedUserIds,
  order: $order,
  attachments: $attachments,
  reminderMinute: $reminderMinute,
  isComplete: $isComplete,
  status: $status,
  priority: $priority,
  sourceConversationIds: $sourceConversationIds,
  customFieldsData: $customFieldsData,
  tagIds: $tagIds
  branchIds: $branchIds
  departmentIds: $departmentIds
`;

const tagFields = isEnabled('tags')
  ? `tag {
        _id
        name
        colorCode
        order
      }`
  : '';

const tagsFields = isEnabled('tags')
  ? `tags {
        _id
        name
        colorCode
        order
      }`
  : '';

const customerFields = isEnabled('contacts')
  ? `
      customers {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        visitorContactInfo
      }
    
  `
  : ``;

const companyFields = isEnabled('contacts')
  ? `
      companies {
        _id
        primaryName
        links
      }
  `
  : ``;

export const commonFields = `
  _id
  name
  stageId
  hasNotified
  pipeline {
    _id
    name
    tagId

    ${tagFields}
  }
  boardId
  ${companyFields}
  ${customerFields}
  ${tagsFields}
  tagIds
  startDate
  closeDate
  description
  priority
  assignedUsers {
    _id
    username
    email
    isActive

    details {
      avatar
      fullName
    }
  }
  labels {
    _id
    name
    colorCode
  }
  labelIds
  stage {
    probability
    type
    defaultTick
  }
  isWatched
  attachments {
    name
    url
    type
    size
  }
  createdAt
  modifiedAt
  modifiedBy
  reminderMinute
  isComplete
  status
  createdUser {
    _id
    details {
      fullName
      avatar
    }
  }
  order
  customFieldsData
  score
  timeTrack {
    status
    timeSpent
    startDate
  }
  number
  customProperties
  branchIds
  departmentIds
`;

const dealsAdd = `
  mutation dealsAdd($name: String!,${commonMutationVariables}) {
    dealsAdd(name: $name, ${commonMutationParams}) {
      ${dealFields},
      ${commonFields}
    }
  }
`;

const dealDetail = `
query DealDetail($id: String!) {
  dealDetail(_id: $id) {
    _id
    name
    stage {
      _id
      name
    }
    stageId
  }
}
`;

export { dealsAdd, dealDetail };
