const fields = `
  _id
  name
  accountId
  groupId
`;

const groupFields = `
  _id
  name
  isPrivate
  
  calendars {
    ${fields}
  }
`;

const groups = `
  query calendarGroups {
    calendarGroups {
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
  groups,
  groupGetLast,
  groupDetail,
  calendars,
  calendarDetail
};
