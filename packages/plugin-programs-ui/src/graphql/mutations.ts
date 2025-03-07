const add = `
  mutation programsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    programsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation programsRemove($_id: String!){
    programsRemove(_id: $_id)
  }
  `;

const edit = `
  mutation programsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    programsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    programTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    programTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    programTypesEdit(_id: $_id, name: $name){
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
  editType,
};
