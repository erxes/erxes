const add = `
  mutation cmssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    cmssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation cmssRemove($_id: String!){
    cmssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation cmssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    cmssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    cmsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    cmsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    cmsTypesEdit(_id: $_id, name: $name){
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
