const fields = `
  _id
  name
  accountId
  groupId
  color
`;

const groupFields = `
  _id
  name
  isPrivate
  memberIds
  boardId
  
  calendars {
    ${fields}
  }
`;

const boardFields = `
  _id
  name

  groups {
    _id
    name
  }
`;

const boards = `
  query calendarBoards {
    calendarBoards {
      _id
      name
    }
  }
`;

const boardGetLast = `
  query calendarBoardGetLast {
    calendarBoardGetLast {
      ${boardFields}
    }
  }
`;

const boardDetail = `
  query calendarBoardDetail($_id: String!) {
    calendarBoardDetail(_id: $_id) {
      ${boardFields}
    }
  }
`;

const groups = `
  query calendarGroups($boardId: String) {
    calendarGroups(boardId: $boardId) {
      ${groupFields}
    }
  }
`;

const groupGetLast = `
  query calendarGroupGetLast {
    calendarGroupGetLast {
      ${groupFields}
    }
  }
`;

const groupDetail = `
  query calendarGroupDetail($_id: String!) {
    calendarGroupDetail(_id: $_id) {
      ${groupFields}
    }
  }
`;

const calendars = `
  query calendars($groupId: String!) {
    calendars(groupId: $groupId) {
      ${fields}
    }
  }
`;

const calendarDetail = `
  query calendarDetail($_id: String!) {
    calendarDetail(_id: $_id) {
      ${fields}
    }
  }
`;

export default {
  boards,
  boardGetLast,
  boardDetail,
  groups,
  groupGetLast,
  groupDetail,
  calendars,
  calendarDetail
};
