const add = `
  mutation activitiesAdd($name: String!, $expiryDate: Date, $typeId:String) {
    activitiesAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation activitiesRemove($_id: String!){
    activitiesRemove(_id: $_id)
  }
  `;

const edit = `
  mutation activitiesEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    activitiesEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    activityTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    activityTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    activityTypesEdit(_id: $_id, name: $name){
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
