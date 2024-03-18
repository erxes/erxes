import { checklistFields } from './queries';

export const commonVariables = `
  $contentType: String,
  $contentTypeId: String,
  $title: String
`;

export const commonParams = `
  contentType: $contentType,
  contentTypeId: $contentTypeId,
  title: $title
`;

const checklistsAdd = `
  mutation taskChecklistsAdd(
    ${commonVariables}
  ) {
    taskChecklistsAdd(
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

const checklistsEdit = `
  mutation taskChecklistsEdit(
    $_id: String!,
    ${commonVariables}
  ) {
    taskChecklistsEdit(
      _id: $_id,
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

const checklistsRemove = `
  mutation taskChecklistsRemove($_id: String!) {
    taskChecklistsRemove(_id: $_id) {
      _id
    }
  }
`;

// checklist items

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

const checklistItemsAdd = `
  mutation taskChecklistItemsAdd(
    ${commonItemVariables}
  ) {
    taskChecklistItemsAdd(
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

const checklistItemsEdit = `
  mutation taskChecklistItemsEdit(
    $_id: String!,
    ${commonItemVariables}
  ) {
    taskChecklistItemsEdit(
      _id: $_id,
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

const checklistItemsRemove = `
  mutation taskChecklistItemsRemove($_id: String!) {
    taskChecklistItemsRemove(_id: $_id) {
      _id
    }
  }
`;

const checklistItemsOrder = `
  mutation taskChecklistItemsOrder($_id: String!, $destinationIndex: Int) {
    taskChecklistItemsOrder(_id: $_id destinationIndex: $destinationIndex) {
      _id
    }
  }
`;

export default {
  checklistsAdd,
  checklistsEdit,
  checklistsRemove,
  checklistItemsAdd,
  checklistItemsEdit,
  checklistItemsOrder,
  checklistItemsRemove,
};
