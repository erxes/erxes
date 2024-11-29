const add = `
  mutation bmsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    bmsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation bmsRemove($_id: String!){
    bmsRemove(_id: $_id)
  }
  `;

const edit = `
  mutation bmsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    bmsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    bmTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    bmTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    bmTypesEdit(_id: $_id, name: $name){
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
