const calendars = `
  query calendarAccounts($groupId: String) {
    calendarAccounts(groupId: $groupId) {
      _id
      name
      color
      accountId
      userId
      isPrimary

      calendars {
        _id
        providerCalendarId
        accountUid
        name
        description
        readOnly
        color
      }
    }
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

export default {
  calendars,
  boardGetLast,
  boards,
  boardDetail
};
