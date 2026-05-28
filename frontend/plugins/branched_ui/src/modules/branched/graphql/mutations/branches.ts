import gql from "graphql-tag";

const branchMutationVariables = `
  $productsData: JSON,
  $paymentsData: JSON,
  $extraData: JSON,
`;

const branchMutationParams = `
  productsData: $productsData,
  paymentsData: $paymentsData,
  extraData: $extraData,
`;

export const branchFields = `
  _id
  name
  address
  phone
  email
  managerId
  employeeIds
  isActive
  createdAt
  updatedAt
`;

export const commonMutationVariables = `
  $parentId: String,
  $processId: String,
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
  $propertiesData: JSON,
  $tagIds: [String]
  $branchIds:[String],
  $departmentIds:[String]
`;

export const commonMutationParams = `
  parentId: $parentId,
  processId: $processId,
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
  propertiesData: $propertiesData,
  tagIds: $tagIds
  branchIds: $branchIds
  departmentIds: $departmentIds
`;

export const ADD_BRANCH = gql`
  mutation branchesAdd($name: String, ${branchMutationVariables} ${commonMutationVariables}) {
    branchesAdd(name: $name, ${branchMutationParams}, ${commonMutationParams}) {
      ${branchFields}
    }
  }
`;

export const EDIT_BRANCH = gql`
  mutation branchesEdit($_id: String!, $name: String, ${branchMutationVariables} ${commonMutationVariables}) {
    branchesEdit(_id: $_id, name: $name, ${branchMutationParams}, ${commonMutationParams}) {
      ${branchFields}
    }
  }
`;

export const REMOVE_BRANCH = gql`
  mutation branchesRemove($_id: String!) {
    branchesRemove(_id: $_id) {
      _id
    }
  }
`;

export const ADD_SALE = gql`
  mutation salesAdd($amount: Float!, $date: DateTime!, $branchId: String!, $productId: String!, $quantity: Int!) {
    salesAdd(amount: $amount, date: $date, branchId: $branchId, productId: $productId, quantity: $quantity) {
      _id
      amount
      date
      branchId
      productId
      quantity
    }
  }
`;

export const EDIT_SALE = gql`
  mutation salesEdit($_id: String!, $amount: Float, $date: DateTime, $branchId: String, $productId: String, $quantity: Int) {
    salesEdit(_id: $_id, amount: $amount, date: $date, branchId: $branchId, productId: $productId, quantity: $quantity) {
      _id
      amount
      date
      branchId
      productId
      quantity
    }
  }
`;

export const REMOVE_SALE = gql`
  mutation salesRemove($_id: String!) {
    salesRemove(_id: $_id) {
      _id
    }
  }
`;

export const ADD_TASK = gql`
  mutation tasksAdd($title: String!, $description: String, $assigneeId: String, $branchId: String!, $dueDate: DateTime, $status: String, $priority: String) {
    tasksAdd(title: $title, description: $description, assigneeId: $assigneeId, branchId: $branchId, dueDate: $dueDate, status: $status, priority: $priority) {
      _id
      title
      description
      assigneeId
      branchId
      dueDate
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

export const EDIT_TASK = gql`
  mutation tasksEdit($_id: String!, $title: String, $description: String, $assigneeId: String, $branchId: String, $dueDate: DateTime, $status: String, $priority: String) {
    tasksEdit(_id: $_id, title: $title, description: $description, assigneeId: $assigneeId, branchId: $branchId, dueDate: $dueDate, status: $status, priority: $priority) {
      _id
      title
      description
      assigneeId
      branchId
      dueDate
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_TASK = gql`
  mutation tasksRemove($_id: String!) {
    tasksRemove(_id: $_id) {
      _id
    }
  }
`;