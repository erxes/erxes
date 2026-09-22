import { gql } from '@apollo/client';
import { checklistFields } from '@/deals/graphql/mutations/ChecklistMutations';

export const CHECKLIST_DETAIL_CHANGED = gql`
  subscription salesChecklistDetailChanged($_id: String!) {
    salesChecklistDetailChanged(_id: $_id) {
      ${checklistFields}
    }
  }
`;

export const CHECKLISTS_CHANGED = gql`
  subscription salesChecklistsChanged(
    $contentType: String!
    $contentTypeId: String!
  ) {
    salesChecklistsChanged(
      contentType: $contentType
      contentTypeId: $contentTypeId
    ) {
      ${checklistFields}
    }
  }
`;
