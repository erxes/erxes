import { gql } from '~/gql';

export const ADD_CHECKLISTS = gql(`
  mutation salesChecklistsAdd($contentTypeId: String, $title: String) {
    salesChecklistsAdd(contentTypeId: $contentTypeId, title: $title) {
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
        order
      }
      percent
    }
  }
`);

export const EDIT_CHECKLISTS = gql(`
  mutation salesChecklistsEdit(
    $_id: String!
    $contentTypeId: String
    $title: String
  ) {
    salesChecklistsEdit(
      _id: $_id
      contentTypeId: $contentTypeId
      title: $title
    ) {
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
        order
      }
      percent
    }
  }
`);

export const REMOVE_CHECKLISTS = gql(`
  mutation salesChecklistsRemove($_id: String!) {
    salesChecklistsRemove(_id: $_id) {
      _id
    }
  }
`);

export const CHECKLIST_ITEMS_ADD = gql(`
  mutation salesChecklistItemsAdd(
    $checklistId: String
    $isChecked: Boolean
    $content: String
  ) {
    salesChecklistItemsAdd(
      checklistId: $checklistId
      isChecked: $isChecked
      content: $content
    ) {
      _id
      checklistId
      order
      isChecked
      content
    }
  }
`);

export const CHECKLIST_ITEMS_EDIT = gql(`
  mutation salesChecklistItemsEdit(
    $_id: String!
    $checklistId: String
    $isChecked: Boolean
    $content: String
  ) {
    salesChecklistItemsEdit(
      _id: $_id
      checklistId: $checklistId
      isChecked: $isChecked
      content: $content
    ) {
      _id
      checklistId
      order
      isChecked
      content
    }
  }
`);

export const CHECKLIST_ITEMS_REMOVE = gql(`
  mutation salesChecklistItemsRemove($_id: String!) {
    salesChecklistItemsRemove(_id: $_id) {
      _id
    }
  }
`);

export const CHECKLIST_ITEMS_ORDER = gql(`
  mutation salesChecklistItemsOrder($_id: String!, $destinationIndex: Int) {
    salesChecklistItemsOrder(_id: $_id, destinationIndex: $destinationIndex) {
      _id
    }
  }
`);
