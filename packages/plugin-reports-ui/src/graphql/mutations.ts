const add = `
  mutation reportssAdd($name: String!, $expiryDate: Date, $typeId:String) {
    reportssAdd(name:$name, expiryDate: $expiryDate, typeId:$typeId) {
      name
      _id
      expiryDate
      typeId
    }
  }
`;

const remove = `
  mutation reportssRemove($_id: String!){
    reportssRemove(_id: $_id)
  }
  `;

const edit = `
  mutation reportssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    reportssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    reportsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    reportsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    reportsTypesEdit(_id: $_id, name: $name){
      _id
    }
  }
`;

const report_params = `
  $name: String,
  $visibility: VisibilityType,
  $assignedUserIds: [String],
  $assignedDepartmentIds: [String],
  $tagIds: [String],
`;

const report_params_def = `
  name: $name,
  visibility: $visibility,
  assignedUserIds: $assignedUserIds,
  assignedDepartmentIds: $assignedDepartmentIds,
  tagIds: $tagIds,
`;

const reportsAdd = `
mutation reportsAdd(${report_params}) {
  reportsAdd(${report_params_def}) {
    _id
    name
    visibility
    assignedUserIds
    assignedDepartmentIds
    tagIds
  }
}
`;

const reportsRemoveMany = `
mutation reportsRemoveMany($ids: [String]!) {
  reportsRemoveMany(ids: $ids)
}`;

const reportsEdit = `
mutation reportsEdit($_id: String!, ${report_params}) {
  reportsEdit(_id: $_id, ${report_params_def}) {
    name
    visibility
    assignedUserIds
    assignedDepartmentIds
    tagIds
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
  reportsAdd,
  reportsRemoveMany,
  reportsEdit
};
