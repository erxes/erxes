const add = `
  mutation goalssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    goalssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation goalssRemove($_id: String!){
    goalssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation goalssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    goalssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    goalsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    goalsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    goalsTypesEdit(_id: $_id, name: $name){
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
