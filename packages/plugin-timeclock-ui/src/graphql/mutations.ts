const clockRemove = `
  mutation timeclockRemove($_id: String!){
    timeclockRemove(_id: $_id)
  }
  `;

const clockStart = `
  mutation timeclockStart($userId: String){
    timeclockStart(userId: $userId){
      _id
    }
  }
`;

const clockStop = `
  mutation timeclockStop( $userId: String, $_id: String){
    timeclockStop(userId: $userId, _id: $_id){
      _id
    }
  }
`;

const sendAbsenceRequest = `
  mutation sendAbsenceRequest($startTime: Date, $endTime: Date, $userId: String, $reason: String, $explanation: String){
    sendAbsenceRequest(startTime: $startTime, endTime: $endTime, userId: $userId, reason: $reason, explanation: $explanation){
      _id
    }
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

export default {
  sendScheduleRequest,
  submitShift,
  sendAbsenceRequest,
  solveAbsence,
  solveSchedule,
  solveShift,
  clockRemove,
  clockStart,
  clockStop
};
