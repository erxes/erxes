const clockRemove = `
  mutation timeclockRemove($_id: String!){
    timeclockRemove(_id: $_id)
  }
  `;

const clockStart = `
  mutation timeclockStart($userId: String, $longitude: Float, $latitude: Float, $deviceType: String){
    timeclockStart(userId: $userId, longitude: $longitude, latitude: $latitude, deviceType: $deviceType){
      _id
    }
  }
`;

const clockStop = `
  mutation timeclockStop( $userId: String, $_id: String, $longitude: Float, $latitude: Float,$deviceType: String){
    timeclockStop(userId: $userId, _id: $_id, longitude: $longitude, latitude: $latitude, deviceType : $deviceType){
      _id
    }
  }
`;

const sendAbsenceRequest = `
  mutation sendAbsenceRequest($startTime: Date, $endTime: Date, $userId: String, $reason: String, $explanation: String, $attachment: AttachmentInput, $absenceTypeId: String){
    sendAbsenceRequest(startTime: $startTime, endTime: $endTime, userId: $userId, reason: $reason, explanation: $explanation, attachment: $attachment, absenceTypeId: $absenceTypeId){
      _id
    }
  }`;

const absenceTypeAdd = `
  mutation absenceTypeAdd($name: String, $explRequired: Boolean, $attachRequired: Boolean, $shiftRequest: Boolean){
    absenceTypeAdd(name: $name, explRequired: $explRequired, attachRequired: $attachRequired, shiftRequest: $shiftRequest){
      _id
    }
  }`;

const absenceTypeEdit = `
  mutation absenceTypeEdit($_id: String, $name: String, $explRequired: Boolean, $attachRequired: Boolean, $shiftRequest: Boolean){
    absenceTypeEdit(_id: $_id, name: $name, explRequired: $explRequired, attachRequired: $attachRequired, shiftRequest: $shiftRequest){
      _id
    }
  }`;

const absenceTypeRemove = `
  mutation absenceTypeRemove($_id: String!){
    absenceTypeRemove(_id: $_id)
  }`;

const sendScheduleRequest = `
  mutation sendScheduleRequest($userId: String, $shifts: [ShiftsRequestInput], $scheduleConfigId: String){
    sendScheduleRequest(userId: $userId, shifts: $shifts, scheduleConfigId: $scheduleConfigId){
      _id
    }
  }`;

const submitSchedule = `
  mutation submitSchedule($branchIds: [String], $departmentIds: [String],$userIds: [String], $shifts: [ShiftsRequestInput], $scheduleConfigId: String){
    submitSchedule(branchIds: $branchIds, departmentIds:$departmentIds, userIds: $userIds, shifts: $shifts, scheduleConfigId: $scheduleConfigId){
      _id
    }
  }`;

const solveAbsence = `
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

const scheduleConfigAdd = `mutation scheduleConfigAdd($scheduleName: String, $configShiftStart: String, $configShiftEnd: String, $scheduleConfig: [ShiftsRequestInput]){
  scheduleConfigAdd(scheduleName: $scheduleName, configShiftStart:$configShiftStart, configShiftEnd: $configShiftEnd, scheduleConfig : $scheduleConfig){
    _id
  }
}`;
const scheduleConfigEdit = `mutation scheduleConfigEdit($_id: String, $scheduleName: String, $configShiftStart: String, $configShiftEnd: String, $scheduleConfig: [ShiftsRequestInput]){
  scheduleConfigEdit(_id: $_id, scheduleName: $scheduleName,configShiftStart:$configShiftStart, configShiftEnd: $configShiftEnd, scheduleConfig : $scheduleConfig){
    _id
  }
}`;

const scheduleConfigRemove = `mutation scheduleConfigRemove($_id: String){
  scheduleConfigRemove(_id: $_id)
}`;

const extractAllDataFromMySQL = `
mutation extractAllDataFromMySQL($startDate: String, $endDate: String){
  extractAllDataFromMySQL(startDate: $startDate, endDate: $endDate){
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
  solveAbsence,
  solveSchedule,
  solveShift,
  clockRemove,
  clockStart,
  clockStop,
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
  extractAllDataFromMySQL
};
