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

const checklistsEdit = `
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

const checklistsRemove = `
  mutation salesChecklistsRemove($_id: String!) {
    salesChecklistsRemove(_id: $_id) {
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
    salesChecklistItemsAdd(
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

const checklistItemsEdit = `
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

const checklistItemsRemove = `
  mutation salesChecklistItemsRemove($_id: String!) {
    salesChecklistItemsRemove(_id: $_id) {
      _id
    }
  }
`;

const checklistItemsOrder = `
  mutation salesChecklistItemsOrder($_id: String!, $destinationIndex: Int) {
    salesChecklistItemsOrder(_id: $_id destinationIndex: $destinationIndex) {
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
