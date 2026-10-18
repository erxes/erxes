import { gql } from '~/gql';

export const GET_CHECKLISTS = gql(`
  query salesChecklists($contentTypeId: String) {
    salesChecklists(contentTypeId: $contentTypeId) {
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

export const GET_CHECKLIST_DETAIL = gql(`
  query salesChecklistDetail($_id: String!) {
    salesChecklistDetail(_id: $_id) {
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
