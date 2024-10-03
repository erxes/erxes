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
  mutation tasksChecklistsAdd(
    ${commonVariables}
  ) {
    tasksChecklistsAdd(
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

const checklistsEdit = `
  mutation tasksChecklistsEdit(
    $_id: String!,
    ${commonVariables}
  ) {
    tasksChecklistsEdit(
      _id: $_id,
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

const checklistsRemove = `
  mutation tasksChecklistsRemove($_id: String!) {
    tasksChecklistsRemove(_id: $_id) {
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
  mutation checklistItemsAdd(
    ${commonItemVariables}
  ) {
    tasksChecklistItemsAdd(
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

const checklistItemsEdit = `
  mutation tasksChecklistItemsEdit(
    $_id: String!,
    ${commonItemVariables}
  ) {
    tasksChecklistItemsEdit(
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
  mutation tasksChecklistItemsRemove($_id: String!) {
    tasksChecklistItemsRemove(_id: $_id) {
      _id
    }
  }
`;

const checklistItemsOrder = `
  mutation tasksChecklistItemsOrder($_id: String!, $destinationIndex: Int) {
    tasksChecklistItemsOrder(_id: $_id destinationIndex: $destinationIndex) {
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
