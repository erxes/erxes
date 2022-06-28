const salesLogVariables = `
  $name: String,
  $description: String,
  $date: Date,
  $type: String,
  $labels: [String],
  $branchId: String,
  $departmentId: String
`;

const salesLogValues = `
  name: $name,
  description: $description,
  date: $date,
  type: $type,
  labels: $labels,
  branchId: $branchId,
  departmentId: $departmentId
`;

const salesLogDocumentVariables = `
  $_id: String,
  $name: String,
  $description: String,
  $date: Date,
  $type: String,
  $labels: [String],
  $branchId: String,
  $departmentId: String
`;

const salesLogDocumentValues = `
  _id: $_id,
  name: $name,
  description: $description,
  date: $date,
  type: $type,
  labels: $labels,
  branchId: $branchId,
  departmentId: $departmentId
`;

const removeLabel = `
  mutation removeLabel($_id: String) {
    removeLabel(_id: $_id)
  }
`;

const saveLabels = `
  mutation saveLabels($update: [LabelInput], $add: [AddLabelInput]) {
    saveLabels(update: $update, add: $add){
      _id
    }
  }
`;

const salesLogAdd = `
  mutation salesLogAdd(${salesLogVariables}) {
    salesLogAdd(${salesLogValues}) {
      _id
      name
      description
      status
      type
      date
      labels
      branchId
      departmentId
      createdAt
      createdBy
      createdUser {
        _id
        username
      }
    }
  }
`;

const salesLogEdit = `
  mutation salesLogEdit(${salesLogDocumentVariables}) {
    salesLogEdit(${salesLogDocumentValues}) {
      _id
      name
      description
      status
      type
      date
      labels
      branchId
      departmentId
    }
  }
`;

const salesLogRemove = `
  mutation salesLogRemove($_id: String) {
    salesLogRemove(_id: $_id)
  }
`;

const salesLogStatusUpdate = `
  mutation salesLogStatusUpdate($_id: String, $status: String) {
    salesLogStatusUpdate(_id: $_id, status: $status)
  }
`;

const saveTimeframes = `
  mutation saveTimeframes($update: [TimeframeInput], $add: [AddTimeframeInput]) {
    saveTimeframes(update: $update, add: $add){
      _id
    }
  }
`;

const removeTimeframe = `
  mutation removeTimeframe($_id: String) {
    removeTimeframe(_id: $_id)
  }
`;

const saveDayPlanConfig = `
  mutation saveDayPlanConfig($salesLogId: String, $data: JSON) {
    saveDayPlanConfig(salesLogId: $salesLogId, data: $data)
    {
      _id
    }
  }
`;

const saveMonthPlanConfig = `
  mutation saveMonthPlanConfig ($salesLogId: String, $day: Date, $data: JSON){
    saveMonthPlanConfig(salesLogId: $salesLogId, day: $day, data: $data){
      _id
    }
  }
`;

const saveYearPlanConfig = `
  mutation saveYearPlanConfig ($salesLogId: String, $data: JSON){
    saveYearPlanConfig(salesLogId: $salesLogId, data: $data){
      _id
    }
  }
`;

export default {
  saveLabels,
  removeLabel,
  salesLogAdd,
  salesLogEdit,
  salesLogRemove,
  salesLogStatusUpdate,
  saveTimeframes,
  removeTimeframe,
  saveDayPlanConfig,
  saveMonthPlanConfig,
  saveYearPlanConfig
};
