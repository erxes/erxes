// queries

const commonTypes = `
  _id
  compaignId
  createdAt
  usedAt
  voucherCompaignId

  ownerType
  ownerId

  compaign
`;

const loyaltyFields = `
  ownerId
  ownerType
  score
  vouchers {
    ${commonTypes}
    status
    bonusInfo
  }
  lotteries {
    ${commonTypes}
    status
    number
    awardId
    voucherId
  }
  spins {
    ${commonTypes}
    status
    awardId
    voucherId
  }
  donates {
    ${commonTypes}
    donateScore
    awardId
    voucherId
  }
`;

const listParamsDef = `
  $ownerType: String
  $ownerId: String
  $statuses: [String]
`;

const listParamsValue = `
  ownerType: $ownerType
  ownerId: $ownerId
  statuses: $statuses
`;

const loyalties = `
  query loyalties(${listParamsDef}) {
    loyalties(${listParamsValue}) {
      ${loyaltyFields}
    }
  }
`;

const commonCompaignTypes = `
  createdAt
  createdBy
  modifiedAt
  modifiedBy
  title
  description
  startDate
  endDate
  finishDateOfUse
  attachment {
    url
    name
    size
    type
  }
  status
`;

const donateCompaignFields = `
  _id,
  ${commonCompaignTypes}
  maxScore
  awards
`;

const lotteryCompaignFields = `
  _id
  ${commonCompaignTypes}
  numberFormat
  buyScore
  awards
`;

const spinCompaignFields = `
  _id
  ${commonCompaignTypes}
  buyScore
  awards
`;

const voucherCompaignFields = `
  _id
  ${commonCompaignTypes}
  buyScore
  score
  scoreAction
  voucherType
  productCategoryIds
  productIds
  discountPercent
  bonusProductId
  bonusCount
  coupon
  spinCompaignId
  spinCount
  lotteryCompaignId
  lotteryCount
`;

const cpDonateCompaigns = `
  query cpDonateCompaigns {
    cpDonateCompaigns {
      ${donateCompaignFields}
    }
  }
`;
const cpLotteryCompaigns = `
  query cpLotteryCompaigns {
    cpLotteryCompaigns {
      ${lotteryCompaignFields}
    }
  }
`;
const cpSpinCompaigns = `
  query cpSpinCompaigns {
    cpSpinCompaigns {
      ${spinCompaignFields}
    }
  }
`;
const cpVoucherCompaigns = `
  query cpVoucherCompaigns {
    cpVoucherCompaigns {
      ${voucherCompaignFields}
    }
  }
`;

// mutations...
const buyVoucher = `
  mutation buyVoucher($compaignId: String, $ownerType: String, $ownerId: String, $count: Int) {
    buyVoucher(compaignId: $compaignId, ownerType: $ownerType, ownerId: $ownerId, count: $count) {
      ${commonTypes}
      status
      bonusInfo
    }
  }
`;
const buySpin = `
  mutation buySpin($compaignId: String, $ownerType: String, $ownerId: String, $count: Int) {
    buySpin(compaignId: $compaignId, ownerType: $ownerType, ownerId: $ownerId, count: $count) {
      ${commonTypes}
      status
      awardId
      voucherId
    }
  }
`;
const buyLottery = `
  mutation buyLottery($compaignId: String, $ownerType: String, $ownerId: String, $count: Int) {
    buyLottery(compaignId: $compaignId, ownerType: $ownerType, ownerId: $ownerId, count: $count) {
      ${commonTypes}
      status
      number
      awardId
      voucherId
    }
  }
`;
const shareScore = `
  mutation shareScore($ownerType: String, $ownerId: String, $score: Float, $destinationOwnerId: String, $destinationPhone: String, $destinationEmail: String, $destinationCode: String) {
    shareScore(ownerType: $ownerType, ownerId: $ownerId, score: $score, destinationOwnerId: $destinationOwnerId, destinationPhone: $destinationPhone, destinationEmail: $destinationEmail, destinationCode: $destinationCode)
  }
`;

const cpDonatesAdd = `
  mutation cpDonatesAdd() {
    cpDonatesAdd() {
      ${commonTypes}
      donateScore
      awardId
      voucherId
    }
  }
`;

const cpDonatesRemove = `
  mutation cpDonatesRemove($_ids: [String]) {
    cpDonatesRemove(_ids: $_ids)
  }
`;

const doSpin = `
  mutation doSpin($_id: String) {
    doSpin(_id: $_id) {
      ${commonTypes}
      status
      awardId
      voucherId
    }
  }
`;

export const loyaltiesQueries = {
  loyalties,
  cpVoucherCompaigns,
  cpDonateCompaigns,
  cpSpinCompaigns,
  cpLotteryCompaigns
};
export const loyaltiesMutations = {
  buyVoucher,
  buySpin,
  buyLottery,
  shareScore,
  cpDonatesAdd,
  cpDonatesRemove,
  doSpin
};
