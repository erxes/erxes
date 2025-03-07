const add = `
  mutation curriculumsAdd($name: String!, $expiryDate: Date, $typeId:String) {
    curriculumsAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation curriculumsRemove($_id: String!){
    curriculumsRemove(_id: $_id)
  }
  `;

const edit = `
  mutation curriculumsEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    curriculumsEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    curriculumTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    curriculumTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    curriculumTypesEdit(_id: $_id, name: $name){
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
