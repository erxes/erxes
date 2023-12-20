import { gql } from "@apollo/client"

const notificationFields = `
_id
notifType
title
link
content
action
createdUser {
  _id
  username
  details {
    avatar
    fullName
    position
  }
  email
}
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
$contentTypes: [String],
`;

const listParamsValue = `
limit: $limit,
page: $page,
perPage: $perPage,
requireRead: $requireRead,
title: $title,
contentTypes: $contentTypes
`;

const notifications = gql`
query notifications(${listParamsDef}) {
  notifications(${listParamsValue}) {
    ${notificationFields}
  }
}
`;

const notificationCounts = gql`
query notificationCounts($requireRead: Boolean, $contentTypes: [String]) {
  notificationCounts(requireRead: $requireRead, contentTypes: $contentTypes)
}
`;

export default {
  notifications,
  notificationCounts
}