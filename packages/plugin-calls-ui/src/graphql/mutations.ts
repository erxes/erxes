const add = `
  mutation callssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    callssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation callssRemove($_id: String!){
    callssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation callssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    callssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    callsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    callsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    callsTypesEdit(_id: $_id, name: $name){
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
