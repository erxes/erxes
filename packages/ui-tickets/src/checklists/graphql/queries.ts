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
  query ticketChecklists(
    ${commonParams}
  ) {
    ticketChecklists(
      ${commonParamDefs}
    ) {
      _id
    }
  }
`;

const checklistDetail = `
  query ticketChecklistDetail($_id: String!) {
    ticketChecklistDetail(_id: $_id) {
      ${checklistFields}
    }
  }
`;

export default {
  checklists,
  checklistDetail,
};
