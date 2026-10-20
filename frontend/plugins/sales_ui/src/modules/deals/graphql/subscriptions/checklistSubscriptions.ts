import { gql } from '~/gql';

export const CHECKLIST_DETAIL_CHANGED = gql(`
  subscription salesChecklistDetailChanged($_id: String!) {
    salesChecklistDetailChanged(_id: $_id) {
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

export const CHECKLISTS_CHANGED = gql(`
  subscription salesChecklistsChanged(
    $contentType: String!
    $contentTypeId: String!
  ) {
    salesChecklistsChanged(
      contentType: $contentType
      contentTypeId: $contentTypeId
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
