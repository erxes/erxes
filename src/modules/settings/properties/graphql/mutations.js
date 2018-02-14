const commonFields = `
  $name: String,
  $description: String,
  $order: Int,
  $contentType: String,
`;

const commonTypes = `
  name: $name,
  description: $description,
  order: $order,
  contentType: $contentType
`;

const fieldsGroupsAdd = `
  mutation fieldsGroupsAdd(${commonFields}) {
    fieldsGroupsAdd(${commonTypes}) {
      _id
    }
  }
`;

const fieldsGroupsEdit = `
  mutation fieldsGroupsEdit($_id: String!, ${commonFields}) {
    fieldsGroupsEdit(_id: $_id, ${commonTypes}) {
      _id
    }
  }
`;

const fieldsGroupsRemove = `
  mutation fieldsGroupsRemove($_id: String!) {
    fieldsGroupsRemove(_id: $_id)
  }
`;

export default {
  fieldsGroupsAdd,
  fieldsGroupsEdit,
  fieldsGroupsRemove
};
