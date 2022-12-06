const add = `
  mutation mobinetsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    mobinetsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation mobinetsRemove($_id: String!){
    mobinetsRemove(_id: $_id)
  }
  `;

const edit = `
  mutation mobinetsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    mobinetsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    mobinetTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    mobinetTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    mobinetTypesEdit(_id: $_id, name: $name){
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
