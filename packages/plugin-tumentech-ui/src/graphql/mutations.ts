const add = `
  mutation tumentechsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    tumentechsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation tumentechsRemove($_id: String!){
    tumentechsRemove(_id: $_id)
  }
  `;

const edit = `
  mutation tumentechsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    tumentechsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    tumentechTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    tumentechTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    tumentechTypesEdit(_id: $_id, name: $name){
      _id
    }
  }
`;

export default {
  add,
  remove,
  edit,
  addType,
  removeType,
  editType
};
