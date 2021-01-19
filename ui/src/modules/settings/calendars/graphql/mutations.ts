const commonGroupParamsDef = `
  $name: String!,
  $boardId: String!,
  $isPrivate: Boolean,
  $memberIds: [String],
`;

const commonGroupParams = `
  name: $name,
  boardId: $boardId,
  isPrivate: $isPrivate,
  memberIds: $memberIds
`;

const groupAdd = `
  mutation calendarGroupsAdd(${commonGroupParamsDef}) {
    calendarGroupsAdd(${commonGroupParams}) {
      _id
    }
  }
`;

const groupEdit = `
  mutation calendarGroupsEdit($_id: String!, ${commonGroupParamsDef}) {
    calendarGroupsEdit(_id: $_id, ${commonGroupParams}) {
      _id
    }
  }
`;

const groupRemove = `
  mutation calendarGroupsDelete($_id: String!) {
    calendarGroupsDelete(_id: $_id)
  }
`;

// board
const boardAdd = `
  mutation calendarBoardsAdd($name: String!) {
    calendarBoardsAdd(name: $name) {
      _id
    }
  }
`;

const boardEdit = `
  mutation calendarBoardsEdit($_id: String!, $name: String) {
    calendarBoardsEdit(_id: $_id, name: $name) {
      _id
    }
  }
`;

const boardRemove = `
  mutation calendarBoardsDelete($_id: String!) {
    calendarBoardsDelete(_id: $_id)
  }
`;

// calendar
const commonParamsDef = `
  $groupId: String!,
  $color: String,
  $isPrimary: Boolean,
`;

const commonParams = `
  color: $color,
  groupId: $groupId,
  isPrimary: $isPrimary
`;

const calendarAdd = `
  mutation calendarsAdd(${commonParamsDef}, $uid: String) {
    calendarsAdd(${commonParams}, uid: $uid) {
      _id
    }
  }
`;

const calendarEdit = `
  mutation calendarsEdit($_id: String!, ${commonParamsDef}) {
    calendarsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const calendarRemove = `
  mutation calendarsDelete($_id: String!, $accountId: String!) {
    calendarsDelete(_id: $_id, accountId: $accountId)
  }
`;

const editAccountCalendar = `
  mutation editAccountCalendar($_id: String!, $name: String, $color: String, $show: Boolean) {
    editAccountCalendar(_id: $_id, name: $name, color: $color, show: $show)
  }
`;

const pageParamsDef = `
  $accountId: String!,
  $appearance: ScheduleAppearance!,
  $event: ScheduleEvent!,
  $timezone: String!,
  $booking: ScheduleBooking,
  $calendarIds: [String],
  $name: String!,
  $slug: String!
`;

const pageParams = `
  accountId: $accountId,
  appearance: $appearance,
  event: $event,
  timezone: $timezone,
  booking: $booking,
  calendarIds: $calendarIds,
  name: $name,
  slug: $slug,
`;

const createSchedulePage = `
  mutation createSchedulePage(${pageParamsDef}) {
    createSchedulePage(${pageParams})
  }
`;

const editSchedulePage = `
  mutation editSchedulePage($_id: String!, ${pageParamsDef}) {
    editSchedulePage(_id: $_id, ${pageParams})
  }
`;

const deleteSchedulePage = `
  mutation deleteSchedulePage($pageId: String!) {
    deleteSchedulePage(pageId: $pageId)
  }
`;

export default {
  boardAdd,
  boardEdit,
  boardRemove,
  groupAdd,
  groupEdit,
  groupRemove,
  calendarAdd,
  calendarEdit,
  calendarRemove,
  editAccountCalendar,
  createSchedulePage,
  deleteSchedulePage,
  editSchedulePage
};
