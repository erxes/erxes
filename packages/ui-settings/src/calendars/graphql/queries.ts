const fields = `
  _id
  name
  accountId
  groupId
  color
  isPrimary
  userId
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

export default {
  boards,
  boardGetLast,
  boardDetail
};
