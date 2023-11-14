const add = `
  mutation zmssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    zmssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation zmssRemove($_id: String!){
    zmssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation dictionaryEdit($_id: String!, $name:String, $code $checked:Boolean, $typeId:String){
    dictionaryEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
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
    zmsTypesRemove(_id:$_id)
  }
`;

const editDictionary = `
  mutation ZmsDictionaryEdit($id: String!, $name: String, $code: String, $type: String) {
    zmsDictionaryEdit(_id: $id, name: $name, code: $code, type: $type)
  }
`;

export default {
  add,
  remove,
  edit,
  AddParent,
  removeType,
  editDictionary
};
