const absenceTypeParams = `
$name: String, 
$explRequired: Boolean,
$attachRequired: Boolean,
$shiftRequest: Boolean,

$requestType: String,
$requestTimeType: String
$requestHoursPerDay: Float
`;

const absenceTypeValues = `
name: $name,
explRequired: $explRequired,
attachRequired: $attachRequired,
shiftRequest: $shiftRequest,
requestType: $requestType,
requestTimeType: $requestTimeType,
requestHoursPerDay: $requestHoursPerDay
`;

const userFields = `
  _id
  username
  email
  employeeId
  details {
    avatar
    fullName
    firstName
    lastName
    position
  }
  departments {
    title
  }
  branches {
    title
  }
`;

const timeclockEdit = `
  mutation timeclockEdit($_id: String!, $shiftStart: Date, $shiftEnd: Date, $shiftActive: Boolean){
    timeclockEdit(_id: $_id, shiftStart: $shiftStart, shiftEnd: $shiftEnd, shiftActive: $shiftActive){
      _id
    }
  }
  `;
const timeclockRemove = `
  mutation timeclockRemove($_id: String!){
    timeclockRemove(_id: $_id)
  }
  `;

const timeclockStart = `
  mutation timeclockStart($userId: String, $longitude: Float, $latitude: Float, $deviceType: String){
    timeclockStart(userId: $userId, longitude: $longitude, latitude: $latitude, deviceType: $deviceType){
      _id
    }
  }
`;

const timeclockStop = `
  mutation timeclockStop( $userId: String, $_id: String, $longitude: Float, $latitude: Float,$deviceType: String){
    timeclockStop(userId: $userId, _id: $_id, longitude: $longitude, latitude: $latitude, deviceType : $deviceType){
      _id
    }
  }
`;

const timeclockCreate = `
    mutation timeclockCreate($userId: String, $shiftStart: Date, $shiftEnd: Date, $shiftActive: Boolean){
      timeclockCreate(userId: $userId, shiftStart: $shiftStart, shiftEnd: $shiftEnd, shiftActive: $shiftActive){
        _id
      }
    }
`;

const sendAbsenceRequest = `
  mutation sendAbsenceRequest($startTime: Date, $endTime: Date,$requestDates: [String] $userId: String, $reason: String, $explanation: String, $attachment: AttachmentInput, $absenceTypeId: String, $absenceTimeType: String, $totalHoursOfAbsence: String){
    sendAbsenceRequest(startTime: $startTime, endTime: $endTime,requestDates: $requestDates,  userId: $userId, reason: $reason, explanation: $explanation, attachment: $attachment, absenceTypeId: $absenceTypeId, absenceTimeType: $absenceTimeType, totalHoursOfAbsence: $totalHoursOfAbsence ){
      _id
    }
  }`;

const removeAbsenceRequest = `
mutation removeAbsenceRequest($_id: String){
  removeAbsenceRequest(_id: $_id)
}`;

const absenceTypeAdd = `
  mutation absenceTypeAdd(${absenceTypeParams}){
    absenceTypeAdd(${absenceTypeValues}){
      _id
    }
  }`;

const absenceTypeEdit = `
  mutation absenceTypeEdit($_id: String, ${absenceTypeParams}){
    absenceTypeEdit(_id: $_id, ${absenceTypeValues}){
      _id
    }
  }`;

const absenceTypeRemove = `
  mutation absenceTypeRemove($_id: String!){
    absenceTypeRemove(_id: $_id)
  }`;

const sendScheduleRequest = `
  mutation sendScheduleRequest($userId: String, $shifts: [ShiftsRequestInput], $scheduleConfigId: String, $totalBreakInMins: Int){
    sendScheduleRequest(userId: $userId, shifts: $shifts, scheduleConfigId: $scheduleConfigId, totalBreakInMins: $totalBreakInMins){
      _id
    }
  }`;

const submitSchedule = `
  mutation submitSchedule($branchIds: [String], $departmentIds: [String],$userIds: [String], $shifts: [ShiftsRequestInput], $scheduleConfigId: String, $totalBreakInMins: Int){
    submitSchedule(branchIds: $branchIds, departmentIds:$departmentIds, userIds: $userIds, shifts: $shifts, scheduleConfigId: $scheduleConfigId, totalBreakInMins: $totalBreakInMins){
      _id
    }
  }`;

const checkDuplicateScheduleShifts = `
  mutation checkDuplicateScheduleShifts($branchIds: [String], $departmentIds: [String],$userIds: [String], $shifts: [ShiftsRequestInput], $status: String){
    checkDuplicateScheduleShifts(branchIds: $branchIds, departmentIds:$departmentIds, userIds: $userIds, shifts: $shifts, status: $status ){
        shifts{
          _id
          shiftStart
          shiftEnd
          solved
          status
          scheduleConfigId
        }
        user {
          ${userFields}
        }
        solved
    }
  }`;

const solveAbsenceRequest = `
  mutation solveAbsenceRequest($_id: String, $status: String){
    solveAbsenceRequest(_id: $_id, status: $status){
      _id
    }
  }  
`;

const solveSchedule = `
  mutation solveScheduleRequest($_id: String, $status: String){
    solveScheduleRequest(_id: $_id, status: $status){
      _id
    }
  }  
`;

const solveShift = `
  mutation solveShiftRequest($_id: String, $status: String){
    solveShiftRequest(_id: $_id, status: $status){
      _id
    }
  }  
`;
const payDateAdd = `
  mutation payDateAdd($dateNums: [Int]){
    payDateAdd(dateNums: $dateNums){
      _id
    }
  }
`;

const payDateEdit = `
  mutation payDateEdit($_id: String, $dateNums:[Int]){
    payDateEdit(_id: $_id, dateNums: $dateNums){
      _id
    }
  }`;

const payDateRemove = `
  mutation payDateRemove($_id: String){
    payDateRemove(_id: $_id)
  }`;

const holidayAdd = `
  mutation holidayAdd($name: String, $startDate: Date, $endDate: Date){
    holidayAdd(name: $name, startDate: $startDate, endDate: $endDate){
      _id
    }
  }
`;

const holidayEdit = `
  mutation holidayEdit($_id: String, $name: String, $startDate: Date, $endDate: Date){
    holidayEdit(_id: $_id, name: $name, startDate: $startDate, endDate: $endDate){
      _id
    }
  }`;

const holidayRemove = `
  mutation holidayRemove($_id: String){
    holidayRemove(_id: $_id)
  }`;
const scheduleRemove = `
  mutation scheduleRemove($_id: String){
    scheduleRemove(_id: $_id)
  }`;
const scheduleShiftRemove = `
  mutation scheduleShiftRemove($_id: String){
    scheduleShiftRemove(_id: $_id)
  }`;

const scheduleConfigAdd = `mutation scheduleConfigAdd($scheduleName: String, $lunchBreakInMins: Int, $configShiftStart: String, $configShiftEnd: String, $scheduleConfig: [ShiftsRequestInput]){
  scheduleConfigAdd(scheduleName: $scheduleName, lunchBreakInMins : $lunchBreakInMins, configShiftStart:$configShiftStart, configShiftEnd: $configShiftEnd, scheduleConfig : $scheduleConfig){
    _id
  }
}`;
const scheduleConfigEdit = `mutation scheduleConfigEdit($_id: String, $scheduleName: String,$lunchBreakInMins: Int, $configShiftStart: String, $configShiftEnd: String, $scheduleConfig: [ShiftsRequestInput]){
  scheduleConfigEdit(_id: $_id, scheduleName: $scheduleName, lunchBreakInMins : $lunchBreakInMins, configShiftStart:$configShiftStart, configShiftEnd: $configShiftEnd, scheduleConfig : $scheduleConfig){
    _id
  }
}`;

const scheduleConfigRemove = `mutation scheduleConfigRemove($_id: String){
  scheduleConfigRemove(_id: $_id)
}`;

const deviceConfigAdd = `mutation deviceConfigAdd($deviceName: String, $serialNo: String, $extractRequired: Boolean){
  deviceConfigAdd(deviceName: $deviceName, serialNo: $serialNo, extractRequired: $extractRequired ){
    _id
  }
}`;

const deviceConfigEdit = `mutation deviceConfigEdit($_id: String, $deviceName: String, $serialNo: String, $extractRequired: Boolean){
  deviceConfigEdit(_id: $_id, deviceName: $deviceName, serialNo: $serialNo, extractRequired: $extractRequired ){
    _id
  }
}`;

const deviceConfigRemove = `mutation deviceConfigRemove($_id: String){
  deviceConfigRemove(_id: $_id)
}`;

const extractAllDataFromMsSQL = `
mutation extractAllDataFromMsSQL($startDate: String, $endDate: String){
  extractAllDataFromMsSQL(startDate: $startDate, endDate: $endDate){
    _id
  }
}`;

const extractTimeLogsFromMsSql = `
mutation extractTimeLogsFromMsSQL($startDate: String, $endDate: String){
  extractTimeLogsFromMsSQL(startDate: $startDate, endDate: $endDate){
    _id
  }
}`;

const createTimeClockFromLog = `
mutation createTimeClockFromLog($userId: String, $timelog: Date){
  createTimeClockFromLog(userId: $userId, timelog: $timelog){
    _id
  }
}`;

const submitCheckInOutRequest = `
mutation submitCheckInOutRequest($checkType: String, $userId: String, $checkTime: Date){
  submitCheckInOutRequest(checkType: $checkType, userId: $userId, checkTime: $checkTime){
    _id
  }
}`;

export default {
  sendScheduleRequest,
  submitSchedule,
  sendAbsenceRequest,
  absenceTypeAdd,
  absenceTypeEdit,
  absenceTypeRemove,

  checkDuplicateScheduleShifts,
  solveAbsenceRequest,
  removeAbsenceRequest,
  solveSchedule,
  solveShift,

  timeclockEdit,
  timeclockCreate,
  timeclockRemove,
  timeclockStart,
  timeclockStop,

  payDateAdd,
  payDateEdit,
  payDateRemove,

  holidayAdd,
  holidayEdit,
  holidayRemove,

  scheduleRemove,
  scheduleShiftRemove,
  scheduleConfigAdd,
  scheduleConfigEdit,
  scheduleConfigRemove,

  deviceConfigAdd,
  deviceConfigEdit,
  deviceConfigRemove,

  submitCheckInOutRequest,

  extractAllDataFromMsSQL,
  extractTimeLogsFromMsSql,
  createTimeClockFromLog
};
