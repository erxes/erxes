import gql from "graphql-tag";

export const commonVariables = `
  $contentTypeId: String,
  $title: String
`;

export const commonParams = `
  contentTypeId: $contentTypeId,
  title: $title
`;

const commonItemVariables = `
  $checklistId: String,
  $isChecked: Boolean,
  $content: String,
`;

const commonItemParams = `
  checklistId: $checklistId,
  isChecked: $isChecked,
  content: $content,
`;


export const checklistFields = `
  _id
  contentType
  contentTypeId
  title
  createdUserId
  createdDate
  items {
    _id
    checklistId
    isChecked
    content
  }
  percent
`;

export const ADD_CHECKLISTS = gql`
  mutation salesChecklistsAdd(
    ${commonVariables}
  ) {
    salesChecklistsAdd(
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

export const EDIT_CHECKLISTS = gql`
  mutation salesChecklistsEdit(
    $_id: String!,
    ${commonVariables}
  ) {
    salesChecklistsEdit(
      _id: $_id,
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

export const REMOVE_CHECKLISTS = gql`
  mutation salesChecklistsRemove($_id: String!) {
    salesChecklistsRemove(_id: $_id) {
      _id
    }
  }
`;

export const CHECKLIST_ITEMS_ADD = gql`
  mutation salesChecklistItemsAdd(
    ${commonItemVariables}
  ) {
    salesChecklistItemsAdd(
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

export const CHECKLIST_ITEMS_EDIT = gql`
  mutation salesChecklistItemsEdit(
    $_id: String!,
    ${commonItemVariables}
  ) {
    salesChecklistItemsEdit(
      _id: $_id,
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

export const CHECKLIST_ITEMS_REMOVE = gql`
  mutation salesChecklistItemsRemove($_id: String!) {
    salesChecklistItemsRemove(_id: $_id) {
      _id
    }
  }
`;

export const CHECKLIST_ITEMS_ORDER = gql`
  mutation salesChecklistItemsOrder($_id: String!, $destinationIndex: Int) {
    salesChecklistItemsOrder(_id: $_id destinationIndex: $destinationIndex) {
      _id
    }
  }
`;
