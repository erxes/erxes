const commonGroupParamsDef = `
  $name: String!,
  $isPrivate: Boolean,
  $assignedUserIds: [String],
`;

const commonGroupParams = `
  name: $name,
  isPrivate: $isPrivate,
  assignedUserIds: $assignedUserIds
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

const commonParamsDef = `
  $name: String!,
  $groupId: String!,
  $color: String,
`;

const commonParams = `
  name: $name,
  color: $color,
  groupId: $groupId
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

export default {
  groupAdd,
  groupEdit,
  groupRemove,
  calendarAdd,
  calendarEdit,
  calendarRemove
};
