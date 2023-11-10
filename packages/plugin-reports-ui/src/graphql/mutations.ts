const report_params = `
  $name: String,
  $visibility: VisibilityType,
  $assignedUserIds: [String],
  $assignedDepartmentIds: [String],
  $tagIds: [String],
  $reportTemplateType: String
  $serviceName: String
`;

const report_params_def = `
  name: $name,
  visibility: $visibility,
  assignedUserIds: $assignedUserIds,
  assignedDepartmentIds: $assignedDepartmentIds,
  tagIds: $tagIds,
  reportTemplateType: $reportTemplateType
  serviceName: $serviceName
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
  reportsAdd,
  reportsRemoveMany,
  reportsEdit
};
