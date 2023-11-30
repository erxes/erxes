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
const report_chart_params = `
  $name: String,
  $chartType: String
  $layout: String
  $vizState: String
  $serviceName: String
  $templateType: String
  $filter: JSON
`;

const report_chart_params_def = `
  name: $name,
  chartType: $chartType
  layout: $layout
  vizState: $vizState
  filter: $filter
  serviceName: $serviceName
  templateType: $templateType
`;

const report_chart_fields = `
    name
    layout
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
const reportChartsEdit = `
mutation reportChartsEdit($_id: String!, ${report_chart_params}) {
  reportChartsEdit(_id: $_id, ${report_chart_params_def}) {
    ${report_chart_fields}
  }
}
`;
const reportChartsAdd = `
mutation reportChartsAdd($reportId: String!, ${report_chart_params}) {
  reportChartsAdd(reportId: $reportId, ${report_chart_params_def}) {
    ${report_chart_fields}
  }
}
`;
const reportChartsRemove = `
mutation reportChartsRemove($_id: String!){
  reportChartsRemove(_id: $_id)
}`;

export default {
  reportsAdd,
  reportsRemoveMany,
  reportsEdit,
  reportChartsAdd,
  reportChartsEdit,
  reportChartsRemove
};
