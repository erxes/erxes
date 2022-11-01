const clockRemove = `
  mutation timeclockRemove($_id: String!){
    timeclockRemove(_id: $_id)
  }
  `;

const clockStart = `
  mutation timeclockStart($time: Date!, $userId: String){
    timeclockStart(time: $time, userId: $userId){
      _id
    }
  }
`;

const clockStop = `
  mutation timeclockStop($time: Date!, $userId: String, $_id: String){
    timeclockStop(time: $time, userId: $userId, _id: $_id){
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

export default {
  sendAbsenceRequest,
  clockRemove,
  clockStart,
  clockStop
};
