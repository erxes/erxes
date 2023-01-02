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
  mutation sendAbsenceRequest($startTime: Date, $endTime: Date, $userId: String, $reason: String, $explanation: String, $attachment: AttachmentInput){
    sendAbsenceRequest(startTime: $startTime, endTime: $endTime, userId: $userId, reason: $reason, explanation: $explanation, attachment: $attachment){
      _id
    }
  }`;

const absenceTypeAdd = `
  mutation absenceTypeAdd($name: String, $explRequired: Boolean, $attachRequired: Boolean){
    absenceTypeAdd(name: $name, explRequired: $explRequired, attachRequired: $attachRequired){
      _id
    }
  }`;

const absenceTypeEdit = `
  mutation absenceTypeEdit($_id: String, $name: String, $explRequired: Boolean, $attachRequired: Boolean){
    absenceTypeEdit(_id: $_id, name: $name, explRequired: $explRequired, attachRequired: $attachRequired){
      _id
    }
  }`;

const absenceTypeRemove = `
  mutation absenceTypeRemove($_id: String!){
    absenceTypeRemove(_id: $_id)
  }`;

const sendScheduleRequest = `
  mutation sendScheduleRequest($userId: String, $shifts: [ShiftsRequestInput]){
    sendScheduleRequest(userId: $userId, shifts: $shifts){
      _id
    }
  }`;

const submitShift = `
  mutation submitShift($userIds: [String], $shifts: [ShiftsRequestInput]){
    submitShift(userIds: $userIds, shifts: $shifts){
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

const extractAllDataFromMySQL = `
mutation extractAllDataFromMySQL{
  extractAllDataFromMySQL{
    _id
  }
}`;

export default {
  sendScheduleRequest,
  submitShift,
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
  extractAllDataFromMySQL
};
