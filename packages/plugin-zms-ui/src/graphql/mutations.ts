const add = `
mutation CreateZmsDictionary($parentId: String, $name: String, $code: String, $type: String, $isParent: Boolean=false) {
  createZmsDictionary(parentId: $parentId, name: $name, code: $code, type: $type, isParent: $isParent) {
    _id
    parentId
    name
    code
    type
    isParent
    createdAt
    createdBy
  }
}
`;

const removeDictionary = `
  mutation zmsDictionaryRemove($_id: String!){
    zmsDictionaryRemove(_id: $_id)
  }
  `;

const AddParent = `
    mutation CreateZmsDictionary($parentId: String, $name: String, $code: String, $type: String, $isParent: Boolean=true) {
      createZmsDictionary(parentId: $parentId, name: $name, code: $code, type: $type, isParent: $isParent) {
        _id
        parentId
        name
        code
        type
        isParent
        createdAt
        createdBy
      }
    }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    zmsDictionaryRemove(_id:$_id)
  }
`;

const editDictionary = `
  mutation ZmsDictionaryEdit($id: String!, $name: String, $code: String, $type: String) {
    zmsDictionaryEdit(_id: $id, name: $name, code: $code, type: $type)
  }
`;

export default {
  add,
  removeDictionary,
  AddParent,
  removeType,
  editDictionary
};
