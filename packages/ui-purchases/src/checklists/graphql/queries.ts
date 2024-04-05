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
  query purchaseChecklists(
    ${commonParams}
  ) {
    purchaseChecklists(
      ${commonParamDefs}
    ) {
      _id
    }
  }
`;

const checklistDetail = `
  query purchaseChecklistDetail($_id: String!) {
    purchaseChecklistDetail(_id: $_id) {
      ${checklistFields}
    }
  }
`;

export default {
  checklists,
  checklistDetail,
};
