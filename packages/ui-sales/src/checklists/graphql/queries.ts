const commonParams = `
  $contentType: String
  $contentTypeId: String
`;

const commonParamDefs = `
  contentType: $contentType,
  contentTypeId: $contentTypeId,
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

const checklists = `
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

const checklistDetail = `
  query salesChecklistDetail($_id: String!) {
    salesChecklistDetail(_id: $_id) {
      ${checklistFields}
    }
  }
`;

export default {
  checklists,
  checklistDetail,
};
