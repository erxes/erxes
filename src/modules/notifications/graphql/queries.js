const notificationFields = `
  _id
  notifType
  title
  link
  content
  createdUser
  receiver
  date
  isRead
`;

const listParamsDef = `
  $limit: Int,
  $page: Int,
  $perPage: Int,
  $requireRead: Boolean,
  $title: String,
`;

const listParamsValue = `
  limit: $limit,
  page: $page,
  perPage: $perPage,
  requireRead: $requireRead,
  title: $title,
`;

const notifications = `
  query notifications(${listParamsDef}) {
    notifications(${listParamsValue}) {
      ${notificationFields}
    }
  }
`;

const notificationCounts = `
  query notificationCounts($requireRead: Boolean) {
    notificationCounts(requireRead: $requireRead)
  }
`;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      details
      email
    }
  }
`;

export default {
  notifications,
  notificationCounts,
  userDetail
};
