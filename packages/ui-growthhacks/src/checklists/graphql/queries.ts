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
  query checklists(
    ${commonParams}
  ) {
    checklists(
      ${commonParamDefs}
    ) {
      _id
    }
  }
`;

const checklistDetail = `
  query checklistDetail($_id: String!) {
    checklistDetail(_id: $_id) {
      ${checklistFields}
    }
  }
`;

export default {
  checklists,
  checklistDetail
};
