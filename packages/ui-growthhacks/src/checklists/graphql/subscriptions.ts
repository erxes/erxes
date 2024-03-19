const growthhacksChecklistsChanged = `
  subscription growthhacksChecklistsChanged($contentType: String!, $contentTypeId: String!) {
    growthhacksChecklistsChanged(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
    }
  }
`;

const growthhacksChecklistDetailChanged = `
  subscription growthhacksChecklistDetailChanged($_id: String!) {
    growthhacksChecklistDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  growthhacksChecklistsChanged,
  growthhacksChecklistDetailChanged,
};
