const extendSubscription = `
  mutation ForumManuallyExtendSubscription(
    $cpUserId: ID!
    $multiplier: Float!
    $price: Float!
    $unit: ForumTimeDurationUnit!
    $userType: ForumCpUserType!
  ) {
    forumManuallyExtendSubscription(
      cpUserId: $cpUserId
      multiplier: $multiplier
      price: $price
      unit: $unit
      userType: $userType
    ) {
      _id
    }
  }
`;

export default { extendSubscription };
