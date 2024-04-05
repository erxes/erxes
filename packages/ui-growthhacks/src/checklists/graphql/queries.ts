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
  query ghChecklists(
    ${commonParams}
  ) {
    ghChecklists(
      ${commonParamDefs}
    ) {
      _id
    }
  }
`;

const checklistDetail = `
  query ghChecklistDetail($_id: String!) {
    ghChecklistDetail(_id: $_id) {
      ${checklistFields}
    }
  }
`;

export default {
  checklists,
  checklistDetail,
};
