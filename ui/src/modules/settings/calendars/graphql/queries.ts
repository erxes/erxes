const groups = `
  query calendarGroups {
    calendarGroups {
      _id
      name
      isPrivate
    }
  }
`;

const groupGetLast = `
  query calendarGroupGetLast {
    calendarGroupGetLast {
      _id
      name
    }
  }
`;

const groupDetail = `
  query calendarGroupDetail($_id: String!) {
    calendarGroupDetail(_id: $_id) {
      _id
      name
    }
  }
`;

const calendars = `
  query calendars($groupId: String!) {
    calendars(groupId: $groupId) {
      _id
      name
    }
  }
`;

const calendarDetail = `
  query calendarDetail($_id: String!) {
    calendarDetail(_id: $_id) {
      _id
      name
    }
  }
`;

export default {
  groups,
  groupGetLast,
  groupDetail,
  calendars,
  calendarDetail
};
