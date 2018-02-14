const fieldsGroupsAdd = `
  mutation fieldsGroupsAdd($name: String, $description: String, $order: Int, $contentType: String) {
    fieldsGroupsAdd(name: $name, description: $description, order: $order, contentType: $contentType) {
      _id
    }
  }
`;

export default {
  fieldsGroupsAdd
};
