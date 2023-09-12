const addCategory = `
mutation AddCategorySyncSaas($name: String, $description: String, $parentId: String, $code: String) {
  addCategorySyncSaas(name: $name, description: $description, parentId: $parentId, code: $code)
}
`;

const editCategory = `
mutation EditCategorySaasSync($id: String, $name: String, $parentId: String, $description: String, $code: String) {
  editCategorySaasSync(_id: $id, name: $name, parentId: $parentId, description: $description, code: $code)
}
`;
const removeCategory = `
mutation RemoveCategorySaasSync($id: String) {
  removeCategorySaasSync(_id: $id)
}
`;

export default { addCategory, editCategory, removeCategory };
