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
  mutation ticketsChecklistsAdd(
    ${commonVariables}
  ) {
    ticketsChecklistsAdd(
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

const checklistsEdit = `
  mutation ticketsChecklistsEdit(
    $_id: String!,
    ${commonVariables}
  ) {
    ticketsChecklistsEdit(
      _id: $_id,
      ${commonParams}
    ) {
      ${checklistFields}
    }
  }
`;

const checklistsRemove = `
  mutation ticketsChecklistsRemove($_id: String!) {
    ticketsChecklistsRemove(_id: $_id) {
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
    ticketsChecklistItemsAdd(
      ${commonItemParams}
    ) {
      _id
      isChecked
      content
    }
  }
`;

const checklistItemsEdit = `
  mutation ticketsChecklistItemsEdit(
    $_id: String!,
    ${commonItemVariables}
  ) {
    ticketsChecklistItemsEdit(
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
  mutation ticketsChecklistItemsRemove($_id: String!) {
    ticketsChecklistItemsRemove(_id: $_id) {
      _id
    }
  }
`;

const checklistItemsOrder = `
  mutation ticketsChecklistItemsOrder($_id: String!, $destinationIndex: Int) {
    ticketsChecklistItemsOrder(_id: $_id destinationIndex: $destinationIndex) {
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
