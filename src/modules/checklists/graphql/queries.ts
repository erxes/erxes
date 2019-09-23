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
  createdUser
  checklistItems {
    _id
    isChecked
    content
  }
  checklistPercent
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
