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
    isChecked
    content
    order
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
      ${checklistFields}
    }
  }
`;

export default {
  checklists
};
