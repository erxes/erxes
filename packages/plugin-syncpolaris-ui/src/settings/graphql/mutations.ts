const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;
const add = `
  mutation syncpolarissAdd($name: String!, $expiryDate: Date, $typeId:String) {
    syncpolarissAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation syncpolarissRemove($_id: String!){
    syncpolarissRemove(_id: $_id)
  }
  `;

const edit = `
  mutation syncpolarissEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    syncpolarissEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    syncpolarisTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    syncpolarisTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    syncpolarisTypesEdit(_id: $_id, name: $name){
      _id
    }
  }
`;

export default {
  updateConfigs,
  add,
  remove,
  edit,
  addType,
  removeType,
  editType,
};
