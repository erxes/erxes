const add = `
  mutation burenscoringsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    burenscoringsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation burenscoringsRemove($_id: String!){
    burenscoringsRemove(_id: $_id)
  }
  `;

const edit = `
  mutation burenscoringsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    burenscoringsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    burenscoringTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    burenscoringTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    burenscoringTypesEdit(_id: $_id, name: $name){
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
