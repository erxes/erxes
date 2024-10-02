const add = `
  mutation pmssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    pmssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation pmssRemove($_id: String!){
    pmssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation pmssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    pmssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    pmsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    pmsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    pmsTypesEdit(_id: $_id, name: $name){
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
