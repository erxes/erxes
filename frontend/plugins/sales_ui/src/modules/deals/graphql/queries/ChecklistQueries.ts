import { checklistFields } from "../mutations/ChecklistMutations";
import gql from "graphql-tag";

const commonParams = `
  $contentTypeId: String
`;

const commonParamDefs = `
  contentTypeId: $contentTypeId,
`;

export const GET_CHECKLISTS = gql`
  query salesChecklists(
    ${commonParams}
  ) {
    salesChecklists(
      ${commonParamDefs}
    ) {
         ${checklistFields}
    }
  }
`;

export const GET_CHECKLIST_DETAIL = gql`
  query salesChecklistDetail($_id: String!) {
    salesChecklistDetail(_id: $_id) {
      ${checklistFields}
    }
  }
`;