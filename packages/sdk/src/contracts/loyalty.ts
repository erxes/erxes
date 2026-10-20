import * as z from 'zod';
import { defineContract } from './define';

// loyalty@1 campaigns, per-customer records, and score balances. Additive
// changes only (a new entry, a new optional input field, a new output field).
// Anything that would break an extension written against v1 ships as loyalty@2.

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const listOf = <T extends z.ZodType>(item: T) =>
  z.object({
    list: z.array(item).nullable(),
    pageInfo: PageInfo.nullable(),
    totalCount: z.number().nullable(),
  });

const cursorArgs = { limit: 'Int', cursor: 'String' };

const cursorInput = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().min(1).optional(),
};

const ownerType = z.enum(['customer', 'company', 'user']);
const campaignStatus = z.enum(['active', 'draft', 'trash']);
const voucherStatus = z.enum(['new', 'onhold', 'used', 'cancelled', 'expired']);
const recordStatus = z.enum(['new', 'won', 'loss']);
const kind = z.enum(['amount', 'percent']);
const record = z.record(z.string(), z.unknown());

// Campaign fields shared by every kind. Create requires title, startDate and
// endDate (the Mongoose model requires them); edit makes every field optional.
const campaignArgs = {
  title: 'String',
  description: 'String',
  startDate: 'Date',
  endDate: 'Date',
  finishDateOfUse: 'Date',
  status: 'String',
};

const campaignFields = {
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  finishDateOfUse: z.string().optional(),
  status: campaignStatus.optional(),
};

const awardsArg = 'JSON';

const spinAwards = z.array(
  z.object({
    name: z.string().optional(),
    voucherCampaignId: z.string().optional(),
    probability: z.number().min(0).max(100),
  }),
);

const lotteryAwards = z.array(
  z.object({
    name: z.string().optional(),
    voucherCampaignId: z.string().optional(),
    count: z.number().int().min(0),
  }),
);

const donateAwards = z.array(
  z.object({
    minScore: z.number().min(0).optional(),
    voucherCampaignId: z.string().optional(),
  }),
);

const voucherCampaignFields = {
  ...campaignFields,
  kind,
  value: z.number().min(0),
  buyScore: z.number().min(0).optional(),
  voucherType: z.string().optional(),
  discountPercent: z.number().optional(),
  productIds: z.array(z.string().min(1)).optional(),
  validity: z
    .object({
      count: z.number().int().min(1),
      unit: z.enum(['day', 'week', 'month']),
    })
    .optional(),
  perOwnerLimit: z
    .object({
      count: z.number().int().min(1),
      period: z.enum(['campaign', 'year', 'month']),
    })
    .optional(),
};

const voucherCampaignArgs = {
  ...campaignArgs,
  kind: 'Kind',
  value: 'Float',
  buyScore: 'Float',
  voucherType: 'String',
  discountPercent: 'Float',
  productIds: '[String]',
  validity: 'VoucherValidityInput',
  perOwnerLimit: 'VoucherOwnerLimitInput',
};

const couponCampaignFields = {
  ...campaignFields,
  kind,
  value: z.number().min(0),
  buyScore: z.number().int().min(0).optional(),
  redemptionLimitPerUser: z.number().int().min(1).optional(),
  codeRule: z
    .object({
      usageLimit: z.number().int().min(1).optional(),
      codeLength: z.number().int().min(1).optional(),
      prefix: z.string().optional(),
      postfix: z.string().optional(),
      pattern: z.string().optional(),
      staticCode: z.string().optional(),
      charSet: z.array(z.string()).optional(),
      size: z.number().int().min(1).optional(),
    })
    .optional(),
};

const couponCampaignArgs = {
  ...campaignArgs,
  kind: 'Kind',
  value: 'Float',
  buyScore: 'Int',
  redemptionLimitPerUser: 'Int',
  codeRule: 'JSON',
};

const spinCampaignFields = {
  ...campaignFields,
  buyScore: z.number().min(0).optional(),
  awards: spinAwards.optional(),
};

const spinCampaignArgs = {
  ...campaignArgs,
  buyScore: 'Float',
  awards: awardsArg,
};

const lotteryCampaignFields = {
  ...campaignFields,
  buyScore: z.number().min(0).optional(),
  awards: lotteryAwards.optional(),
};

const lotteryCampaignArgs = {
  ...campaignArgs,
  buyScore: 'Float',
  awards: awardsArg,
};

const donateCampaignFields = {
  ...campaignFields,
  maxScore: z.number().min(0).optional(),
  awards: donateAwards.optional(),
};

const donateCampaignArgs = {
  ...campaignArgs,
  maxScore: 'Float',
  awards: awardsArg,
};

const assignmentCampaignFields = {
  ...campaignFields,
  segmentIds: z.array(z.string().min(1)).optional(),
  allowMultiWin: z.boolean().optional(),
  voucherCampaignId: z.string().optional(),
};

const assignmentCampaignArgs = {
  ...campaignArgs,
  segmentIds: '[String]',
  allowMultiWin: 'Boolean',
  voucherCampaignId: 'String',
};

const scoreCampaignFields = {
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  add: record.optional(),
  subtract: record.optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  accountTypeId: z.string().optional(),
  serviceName: z.string().optional(),
  restrictions: record.optional(),
};

const scoreCampaignArgs = {
  title: 'String',
  description: 'String',
  order: 'Int',
  add: 'JSON',
  subtract: 'JSON',
  status: 'String',
  accountTypeId: 'String',
  serviceName: 'String',
  restrictions: 'JSON',
};

const removeInput = z.object({ _ids: z.array(z.string().min(1)).min(1) });

// Output for a campaign kind, selected by the list and get calls.
const VoucherCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  finishDateOfUse: z.string().nullable(),
  kind: z.string().nullable(),
  value: z.number().nullable(),
  buyScore: z.number().nullable(),
  voucherType: z.string().nullable(),
  discountPercent: z.number().nullable(),
  vouchersCount: z.number().nullable(),
  codesCount: z.number().nullable(),
});

const CouponCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  finishDateOfUse: z.string().nullable(),
  kind: z.string().nullable(),
  value: z.number().nullable(),
  buyScore: z.number().nullable(),
  redemptionLimitPerUser: z.number().nullable(),
  codeRule: record.nullable(),
});

const SpinCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  finishDateOfUse: z.string().nullable(),
  buyScore: z.number().nullable(),
  spinsCount: z.number().nullable(),
  awards: z.unknown().nullable(),
});

const LotteryCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  finishDateOfUse: z.string().nullable(),
  numberFormat: z.string().nullable(),
  buyScore: z.number().nullable(),
  lotteriesCount: z.number().nullable(),
  awards: z.unknown().nullable(),
});

const DonateCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  finishDateOfUse: z.string().nullable(),
  maxScore: z.number().nullable(),
  donatesCount: z.number().nullable(),
  awards: z.unknown().nullable(),
});

const AssignmentCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  finishDateOfUse: z.string().nullable(),
  segmentIds: z.array(z.string()).nullable(),
  allowMultiWin: z.boolean().nullable(),
  voucherCampaignId: z.string().nullable(),
  fieldId: z.string().nullable(),
});

const ScoreCampaign = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  order: z.number().nullable(),
  status: z.string().nullable(),
  ownerType: z.string().nullable(),
  accountTypeId: z.string().nullable(),
  serviceName: z.string().nullable(),
  createdAt: z.string().nullable(),
  add: record.nullable(),
  subtract: record.nullable(),
});

// Per-customer records. The model requires campaignId, ownerId and ownerType
// now, but older records may lack them, so they stay nullable.
const Voucher = z.object({
  _id: z.string(),
  campaignId: z.string().nullable(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string().nullable(),
  usedAt: z.string().nullable(),
  heldAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  cancelReason: z.string().nullable(),
  usedIn: record.nullable(),
});

const Spin = z.object({
  _id: z.string(),
  campaignId: z.string().nullable(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  status: z.string().nullable(),
  awardId: z.string().nullable(),
  voucherId: z.string().nullable(),
  voucherCampaignId: z.string().nullable(),
  number: z.string().nullable(),
  usedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const Lottery = z.object({
  _id: z.string(),
  campaignId: z.string().nullable(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  status: z.string().nullable(),
  awardId: z.string().nullable(),
  voucherId: z.string().nullable(),
  voucherCampaignId: z.string().nullable(),
  number: z.string().nullable(),
  usedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const Donate = z.object({
  _id: z.string(),
  campaignId: z.string().nullable(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  donateScore: z.number().nullable(),
  awardId: z.string().nullable(),
  voucherId: z.string().nullable(),
  status: z.string().nullable(),
  usedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const Coupon = z.object({
  _id: z.string(),
  code: z.string().nullable(),
  campaignId: z.string().nullable(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  status: z.string().nullable(),
  usageLimit: z.number().nullable(),
  usageCount: z.number().nullable(),
  redemptionLimitPerUser: z.number().nullable(),
  createdAt: z.string().nullable(),
});

const OwnerCoupon = z.object({
  campaign: CouponCampaign.nullable(),
  coupons: z.array(Coupon).nullable(),
  count: z.number().nullable(),
});

const Assignment = z.object({
  _id: z.string(),
  campaignId: z.string().nullable(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  status: z.string().nullable(),
  segmentIds: z.array(z.string()).nullable(),
  voucherId: z.string().nullable(),
  usedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const ScoreLogItem = z.object({
  _id: z.string(),
  ownerId: z.string().nullable(),
  ownerType: z.string().nullable(),
  change: z.number().nullable(),
  preScore: z.number().nullable(),
  action: z.string().nullable(),
  description: z.string().nullable(),
  campaignId: z.string().nullable(),
  targetId: z.string().nullable(),
  serviceName: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const LoyaltyAccount = z.object({
  _id: z.string(),
  number: z.string(),
  ownerType: z.string(),
  ownerId: z.string(),
  status: z.string().nullable(),
  joinedAt: z.string().nullable(),
  frozenAt: z.string().nullable(),
  frozenReason: z.string().nullable(),
  balances: z
    .array(
      z.object({
        accountTypeId: z.string(),
        balance: z.number().nullable(),
        pending: z.number().nullable(),
        updatedAt: z.string().nullable(),
      }),
    )
    .nullable(),
});

export const loyaltyContract = defineContract('loyalty', 1, [
  // Voucher campaigns
  {
    name: 'voucherCampaigns.list',
    description:
      'Lists voucher campaigns, 20 per page by default. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'voucherCampaigns',
    args: { searchValue: 'String', status: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: campaignStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(VoucherCampaign),
  },
  {
    name: 'voucherCampaigns.get',
    description:
      'Reads one voucher campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'voucherCampaignDetail',
    args: { _id: 'String' },
    notFound: 'not found voucher rule',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: VoucherCampaign.nullable(),
  },
  {
    name: 'voucherCampaigns.create',
    description:
      'Creates a voucher campaign and returns it. kind is "amount" (value is money off) or "percent" (value is the percent off). startDate and endDate are ISO date strings. validity sets how long each issued voucher lasts. Needs loyaltyCampaignCreate.',
    kind: 'write',
    field: 'voucherCampaignsAdd',
    args: voucherCampaignArgs,
    input: z.object(voucherCampaignFields).strict(),
    output: VoucherCampaign,
  },
  {
    name: 'voucherCampaigns.edit',
    description:
      'Updates one voucher campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs loyaltyCampaignUpdate.',
    kind: 'write',
    field: 'voucherCampaignsEdit',
    args: { _id: 'String!', ...voucherCampaignArgs },
    input: z
      .object(voucherCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: VoucherCampaign,
  },
  {
    name: 'voucherCampaigns.remove',
    description:
      'Removes the voucher campaigns with the given _ids. Destructive. Needs loyaltyCampaignRemove.',
    kind: 'destructive',
    field: 'voucherCampaignsRemove',
    args: { _ids: '[String]' },
    input: removeInput.strict(),
    output: z.unknown().nullable(),
  },

  // Coupon campaigns
  {
    name: 'couponCampaigns.list',
    description:
      'Lists coupon campaigns, 20 per page by default. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'couponCampaigns',
    args: { searchValue: 'String', status: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: campaignStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(CouponCampaign),
  },
  {
    name: 'couponCampaigns.get',
    description:
      'Reads one coupon campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'couponCampaign',
    args: { _id: 'String' },
    notFound: 'Campaign not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: CouponCampaign.nullable(),
  },
  {
    name: 'couponCampaigns.create',
    description:
      'Creates a coupon campaign and returns it. kind is "amount" or "percent". codeRule sets the code format and usageLimit for codes generated by coupons.create. Needs loyaltyCampaignCreate.',
    kind: 'write',
    field: 'couponCampaignAdd',
    args: couponCampaignArgs,
    input: z.object(couponCampaignFields).strict(),
    output: CouponCampaign,
  },
  {
    name: 'couponCampaigns.edit',
    description:
      'Updates one coupon campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs loyaltyCampaignUpdate.',
    kind: 'write',
    field: 'couponCampaignEdit',
    args: { _id: 'String', ...couponCampaignArgs },
    input: z
      .object(couponCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: CouponCampaign,
  },
  {
    name: 'couponCampaigns.remove',
    description:
      'Removes the coupon campaigns with the given _ids. Destructive. Needs loyaltyCampaignRemove.',
    kind: 'destructive',
    field: 'couponCampaignsRemove',
    args: { _ids: '[String]' },
    input: removeInput.strict(),
    output: z.unknown().nullable(),
  },

  // Spin campaigns
  {
    name: 'spinCampaigns.list',
    description:
      'Lists spin campaigns, 20 per page by default. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'spinCampaigns',
    args: { searchValue: 'String', status: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: campaignStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(SpinCampaign),
  },
  {
    name: 'spinCampaigns.get',
    description:
      'Reads one spin campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'spinCampaignDetail',
    args: { _id: 'String!' },
    notFound: 'not found spin campaign',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: SpinCampaign.nullable(),
  },
  {
    name: 'spinCampaigns.create',
    description:
      'Creates a spin campaign and returns it. Each award has a probability from 0 to 100, and the probabilities must not sum past 100. buyScore is the score one spin costs to buy. Needs loyaltyCampaignCreate.',
    kind: 'write',
    field: 'spinCampaignsAdd',
    args: spinCampaignArgs,
    input: z.object(spinCampaignFields).strict(),
    output: SpinCampaign,
  },
  {
    name: 'spinCampaigns.edit',
    description:
      'Updates one spin campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs loyaltyCampaignUpdate.',
    kind: 'write',
    field: 'spinCampaignsEdit',
    args: { _id: 'String!', ...spinCampaignArgs },
    input: z
      .object(spinCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: SpinCampaign,
  },
  {
    name: 'spinCampaigns.remove',
    description:
      'Removes the spin campaigns with the given _ids. Destructive. Needs loyaltyCampaignRemove.',
    kind: 'destructive',
    field: 'spinCampaignsRemove',
    args: { _ids: '[String]' },
    input: removeInput.strict(),
    output: z.unknown().nullable(),
  },

  // Lottery campaigns
  {
    name: 'lotteryCampaigns.list',
    description:
      'Lists lottery campaigns, 20 per page by default. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'lotteryCampaigns',
    args: { searchValue: 'String', status: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: campaignStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(LotteryCampaign),
  },
  {
    name: 'lotteryCampaigns.get',
    description:
      'Reads one lottery campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'lotteryCampaignDetail',
    args: { _id: 'String!' },
    notFound: 'not found lottery campaign',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: LotteryCampaign.nullable(),
  },
  {
    name: 'lotteryCampaigns.create',
    description:
      'Creates a lottery campaign and returns it. Each award has a count of tickets it can give out. buyScore is the score one lottery ticket costs. Needs loyaltyCampaignCreate.',
    kind: 'write',
    field: 'lotteryCampaignsAdd',
    args: lotteryCampaignArgs,
    input: z.object(lotteryCampaignFields).strict(),
    output: LotteryCampaign,
  },
  {
    name: 'lotteryCampaigns.edit',
    description:
      'Updates one lottery campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs loyaltyCampaignUpdate.',
    kind: 'write',
    field: 'lotteryCampaignsEdit',
    args: { _id: 'String!', ...lotteryCampaignArgs },
    input: z
      .object(lotteryCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: LotteryCampaign,
  },
  {
    name: 'lotteryCampaigns.remove',
    description:
      'Removes the lottery campaigns with the given _ids. Destructive. Needs loyaltyCampaignRemove.',
    kind: 'destructive',
    field: 'lotteryCampaignsRemove',
    args: { _ids: '[String]' },
    input: removeInput.strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'lotteryCampaigns.draw',
    description:
      'Draws one winning lottery of the campaign for the award awardId and marks it won. Returns the winning lottery as JSON. Fails when the award has no tickets left. Needs lotteryCampaignDo.',
    kind: 'write',
    field: 'doLottery',
    args: { campaignId: 'String', awardId: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        awardId: z.string().min(1),
      })
      .strict(),
    output: z.unknown().nullable(),
  },

  // Donate campaigns
  {
    name: 'donateCampaigns.list',
    description:
      'Lists donate campaigns, 20 per page by default. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'donateCampaigns',
    args: { searchValue: 'String', status: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: campaignStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(DonateCampaign),
  },
  {
    name: 'donateCampaigns.get',
    description:
      'Reads one donate campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'donateCampaignDetail',
    args: { _id: 'String!' },
    notFound: 'not found donate campaign',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: DonateCampaign.nullable(),
  },
  {
    name: 'donateCampaigns.create',
    description:
      'Creates a donate campaign and returns it. maxScore caps one donation, and each award needs minScore above the campaign levels. Needs loyaltyCampaignCreate.',
    kind: 'write',
    field: 'donateCampaignsAdd',
    args: donateCampaignArgs,
    input: z.object(donateCampaignFields).strict(),
    output: DonateCampaign,
  },
  {
    name: 'donateCampaigns.edit',
    description:
      'Updates one donate campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs loyaltyCampaignUpdate.',
    kind: 'write',
    field: 'donateCampaignsEdit',
    args: { _id: 'String!', ...donateCampaignArgs },
    input: z
      .object(donateCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: DonateCampaign,
  },
  {
    name: 'donateCampaigns.remove',
    description:
      'Removes the donate campaigns with the given _ids. Destructive. Needs loyaltyCampaignRemove.',
    kind: 'destructive',
    field: 'donateCampaignsRemove',
    args: { _ids: '[String]' },
    input: removeInput.strict(),
    output: z.unknown().nullable(),
  },

  // Assignment campaigns
  {
    name: 'assignmentCampaigns.list',
    description:
      'Lists assignment campaigns, 20 per page by default. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'assignmentCampaigns',
    args: { searchValue: 'String', status: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: campaignStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(AssignmentCampaign),
  },
  {
    name: 'assignmentCampaigns.get',
    description:
      'Reads one assignment campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'assignmentCampaignDetail',
    args: { _id: 'String!' },
    notFound: 'not found assignment campaign',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: AssignmentCampaign.nullable(),
  },
  {
    name: 'assignmentCampaigns.create',
    description:
      'Creates an assignment campaign and returns it. segmentIds limits who can be assigned it. allowMultiWin lets one owner win more than once. Needs assignmentCampaignCreate.',
    kind: 'write',
    field: 'assignmentCampaignsAdd',
    args: assignmentCampaignArgs,
    input: z.object(assignmentCampaignFields).strict(),
    output: AssignmentCampaign,
  },
  {
    name: 'assignmentCampaigns.edit',
    description:
      'Updates one assignment campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs assignmentCampaignEdit.',
    kind: 'write',
    field: 'assignmentCampaignsEdit',
    args: { _id: 'String!', ...assignmentCampaignArgs },
    input: z
      .object(assignmentCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: AssignmentCampaign,
  },
  {
    name: 'assignmentCampaigns.remove',
    description:
      'Removes the assignment campaigns with the given _ids. Destructive. Needs assignmentCampaignRemove.',
    kind: 'destructive',
    field: 'assignmentCampaignsRemove',
    args: { _ids: '[String]' },
    input: removeInput.strict(),
    output: z.unknown().nullable(),
  },

  // Score campaigns. A score campaign is archived, not deleted, so its
  // removal is a write.
  {
    name: 'scoreCampaigns.list',
    description:
      'Lists score campaigns, 20 per page by default. serviceName filters to the campaigns one service uses. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'scoreCampaigns',
    args: {
      searchValue: 'String',
      status: 'String',
      serviceName: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        searchValue: z.string().optional(),
        status: z.enum(['active', 'draft', 'archived']).optional(),
        serviceName: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(ScoreCampaign),
  },
  {
    name: 'scoreCampaigns.get',
    description:
      'Reads one score campaign by _id. Returns null when no campaign has that _id. Needs loyaltyCampaignView. Read-only.',
    kind: 'read',
    field: 'scoreCampaign',
    args: { _id: 'String' },
    notFound: 'Score campaign not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ScoreCampaign.nullable(),
  },
  {
    name: 'scoreCampaigns.create',
    description:
      'Creates a score campaign and returns it. add is the earning table and subtract holds the spending rules. Needs loyaltyCampaignCreate.',
    kind: 'write',
    field: 'scoreCampaignAdd',
    args: scoreCampaignArgs,
    input: z.object(scoreCampaignFields).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'scoreCampaigns.edit',
    description:
      'Updates one score campaign and returns it. Fields left out keep their values. Fails when no campaign has that _id. Needs loyaltyCampaignUpdate.',
    kind: 'write',
    field: 'scoreCampaignUpdate',
    args: { _id: 'String', ...scoreCampaignArgs },
    input: z
      .object(scoreCampaignFields)
      .partial()
      .extend({ _id: z.string().min(1) })
      .strict(),
    output: ScoreCampaign,
  },
  {
    name: 'scoreCampaigns.archive',
    description:
      'Archives one score campaign by _id, so it stops earning and spending. The record is kept. Needs loyaltyCampaignRemove.',
    kind: 'write',
    field: 'scoreCampaignRemove',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },

  // Vouchers
  {
    name: 'vouchers.list',
    description:
      'Lists vouchers, 20 per page by default. Filter by campaignId, ownerId, ownerType, status, or a createdAt range with fromDate and toDate (ISO dates). Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs voucherView. Read-only.',
    kind: 'read',
    field: 'vouchers',
    args: {
      campaignId: 'String',
      ownerId: 'String',
      ownerType: 'String',
      status: 'String',
      fromDate: 'String',
      toDate: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerId: z.string().optional(),
        ownerType: ownerType.optional(),
        status: voucherStatus.optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(Voucher),
  },
  {
    name: 'vouchers.create',
    description:
      'Issues one voucher from the campaign to the owner and returns it. Fails when the campaign is not running or the owner is over its per-owner limit. Needs voucherCreate.',
    kind: 'write',
    field: 'vouchersAdd',
    args: { campaignId: 'String', ownerId: 'String', ownerType: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerId: z.string().min(1),
        ownerType,
      })
      .strict(),
    output: Voucher,
  },
  {
    name: 'vouchers.buy',
    description:
      'Buys one voucher from the campaign for the owner. It takes the campaign buyScore from the owner score, then issues the voucher. Fails when the campaign has no buyScore. Needs voucherBuy.',
    kind: 'write',
    field: 'buyVoucher',
    args: { campaignId: 'String', ownerType: 'String', ownerId: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerType,
        ownerId: z.string().min(1),
      })
      .strict(),
    output: Voucher,
  },
  {
    name: 'vouchers.cancel',
    description:
      'Cancels one voucher by _id and records the reason. Fails when the voucher is already used or cancelled. Needs voucherEdit.',
    kind: 'write',
    field: 'voucherCancel',
    args: { _id: 'String!', reason: 'String!' },
    input: z
      .object({
        _id: z.string().min(1),
        reason: z.string().min(1),
      })
      .strict(),
    output: Voucher,
  },
  {
    name: 'vouchers.markUsed',
    description:
      'Marks one voucher as used by _id and records where it was used in note, for example an order number. Needs voucherEdit.',
    kind: 'write',
    field: 'voucherMarkUsed',
    args: { _id: 'String!', note: 'String!' },
    input: z
      .object({
        _id: z.string().min(1),
        note: z.string().min(1),
      })
      .strict(),
    output: Voucher,
  },
  {
    name: 'vouchers.extend',
    description:
      'Moves one voucher end date to endDate, an ISO date. It must be later than the current end. Needs voucherEdit.',
    kind: 'write',
    field: 'voucherExtend',
    args: { _id: 'String!', endDate: 'Date!' },
    input: z
      .object({
        _id: z.string().min(1),
        endDate: z.string().min(1),
      })
      .strict(),
    output: Voucher,
  },

  // Spins
  {
    name: 'spins.list',
    description:
      'Lists spins, 20 per page by default. Filter by campaignId, ownerType, ownerId, or status (new, won or loss). Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs spinView. Read-only.',
    kind: 'read',
    field: 'spins',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      status: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerType: ownerType.optional(),
        ownerId: z.string().optional(),
        status: recordStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(Spin),
  },
  {
    name: 'spins.create',
    description:
      'Gives the owner one spin of the campaign and returns it. Needs spinCreate.',
    kind: 'write',
    field: 'spinsAdd',
    args: { campaignId: 'String', ownerType: 'String', ownerId: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerType,
        ownerId: z.string().min(1),
      })
      .strict(),
    output: Spin,
  },
  {
    name: 'spins.buy',
    description:
      'Buys one spin of the campaign for the owner. It takes the campaign buyScore from the owner score, then creates the spin. Fails when the campaign has no buyScore. Needs spinBuy.',
    kind: 'write',
    field: 'buySpin',
    args: { campaignId: 'String', ownerType: 'String', ownerId: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerType,
        ownerId: z.string().min(1),
      })
      .strict(),
    output: Spin,
  },
  {
    name: 'spins.play',
    description:
      'Plays one new spin by _id and returns the spin with its awardId or voucherId. Fails when the spin campaign is outside its dates. Needs spinDo.',
    kind: 'write',
    field: 'doSpin',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Spin,
  },

  // Lotteries
  {
    name: 'lotteries.list',
    description:
      'Lists lottery tickets, 20 per page by default. Filter by campaignId, ownerType, ownerId, or status (new, won or loss). Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs lotteryView. Read-only.',
    kind: 'read',
    field: 'lotteries',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      status: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerType: ownerType.optional(),
        ownerId: z.string().optional(),
        status: recordStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(Lottery),
  },
  {
    name: 'lotteries.create',
    description:
      'Gives the owner one lottery ticket of the campaign and returns it. Needs lotteryCreate.',
    kind: 'write',
    field: 'lotteriesAdd',
    args: { campaignId: 'String', ownerId: 'String', ownerType: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerId: z.string().min(1),
        ownerType,
      })
      .strict(),
    output: Lottery,
  },
  {
    name: 'lotteries.buy',
    description:
      'Buys one lottery ticket of the campaign for the owner. It takes the campaign buyScore from the owner score, then creates the ticket. Fails when the campaign has no buyScore. Needs lotteryBuy.',
    kind: 'write',
    field: 'buyLottery',
    args: { campaignId: 'String', ownerType: 'String', ownerId: 'String' },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerType,
        ownerId: z.string().min(1),
      })
      .strict(),
    output: Lottery,
  },

  // Donates
  {
    name: 'donates.list',
    description:
      'Lists donations, 20 per page by default. Filter by campaignId, ownerType or ownerId. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs donateView. Read-only.',
    kind: 'read',
    field: 'donates',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerType: ownerType.optional(),
        ownerId: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(Donate),
  },
  {
    name: 'donates.create',
    description:
      'Records a donation of donateScore points from the owner to the campaign and returns it. Skips the campaign date and score checks the owner path runs. Needs donateCreate.',
    kind: 'write',
    field: 'donatesAdd',
    args: {
      donateScore: 'Float',
      campaignId: 'String',
      ownerId: 'String',
      ownerType: 'String',
    },
    input: z
      .object({
        donateScore: z.number().min(0).optional(),
        campaignId: z.string().min(1),
        ownerId: z.string().min(1),
        ownerType,
      })
      .strict(),
    output: Donate,
  },

  // Coupons
  {
    name: 'coupons.list',
    description:
      'Lists coupon codes, 20 per page by default. Filter by campaignId, ownerType, ownerId, or status. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs couponView. Read-only.',
    kind: 'read',
    field: 'coupons',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      status: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerType: ownerType.optional(),
        ownerId: z.string().optional(),
        status: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(Coupon),
  },
  {
    name: 'coupons.byOwner',
    description:
      'Lists the coupon codes of one owner, grouped by campaign, with a count per campaign. status filters the codes. Needs couponView. Read-only.',
    kind: 'read',
    field: 'couponsByOwner',
    args: { ownerId: 'String!', status: 'String' },
    input: z
      .object({
        ownerId: z.string().min(1),
        status: z.string().optional(),
      })
      .strict(),
    output: z.array(OwnerCoupon),
  },
  {
    name: 'coupons.create',
    description:
      'Generates the coupon codes for the campaign, using its codeRule, and returns them. Codes are not tied to an owner until redeemed. Needs couponCreate.',
    kind: 'write',
    field: 'couponAdd',
    args: { campaignId: 'String!' },
    input: z.object({ campaignId: z.string().min(1) }).strict(),
    output: z.array(Coupon),
  },

  // Assignments
  {
    name: 'assignments.list',
    description:
      'Lists assignments, 20 per page by default. Filter by campaignId, ownerType, ownerId, or status (new, won or loss). Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs assignmentView. Read-only.',
    kind: 'read',
    field: 'assignments',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      status: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerType: ownerType.optional(),
        ownerId: z.string().optional(),
        status: recordStatus.optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(Assignment),
  },
  {
    name: 'assignments.get',
    description:
      'Reads one assignment by _id. Returns null when no assignment has that _id. Needs assignmentView. Read-only.',
    kind: 'read',
    field: 'assignmentDetail',
    args: { _id: 'String!' },
    notFound: 'not found assignment rule',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Assignment.nullable(),
  },
  {
    name: 'assignments.create',
    description:
      'Assigns the campaign to the owner and returns the assignment. segmentIds records the segments the owner matched. Needs assignmentCreate.',
    kind: 'write',
    field: 'assignmentsAdd',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      segmentIds: '[String]',
    },
    input: z
      .object({
        campaignId: z.string().min(1),
        ownerType,
        ownerId: z.string().min(1),
        segmentIds: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: Assignment,
  },

  // Score logs
  {
    name: 'scoreLogs.list',
    description:
      'Lists score log entries, newest first, 20 per page by default. Filter by campaignId, ownerType, ownerId, or a createdAt range with fromDate and toDate (ISO dates). Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs scoreLogView. Read-only.',
    kind: 'read',
    field: 'scoreLogs',
    args: {
      campaignId: 'String',
      ownerType: 'String',
      ownerId: 'String',
      fromDate: 'String',
      toDate: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        campaignId: z.string().optional(),
        ownerType: ownerType.optional(),
        ownerId: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(ScoreLogItem),
  },
  {
    name: 'scoreLogs.change',
    description:
      'Adds points to, or takes points from, the owner score and returns the score log entry. change is signed: a positive number adds and a negative number takes. action is add or subtract and must match the sign. Needs scoreLogChange.',
    kind: 'write',
    field: 'changeScore',
    args: {
      ownerType: 'String!',
      ownerId: 'String!',
      campaignId: 'String',
      action: 'String!',
      change: 'Float!',
      description: 'String',
    },
    input: z
      .object({
        ownerType,
        ownerId: z.string().min(1),
        campaignId: z.string().optional(),
        action: z.enum(['add', 'subtract']),
        change: z.number(),
        description: z.string().optional(),
      })
      .strict(),
    output: ScoreLogItem,
  },

  // Score balances
  {
    name: 'scores.balance',
    description:
      'Reads the score balance of one owner, as a number. Pass campaignId to read the balance of that campaign field. Read-only.',
    kind: 'read',
    field: 'checkOwnerScore',
    args: { ownerId: 'String', ownerType: 'String', campaignId: 'String' },
    input: z
      .object({
        ownerId: z.string().min(1),
        ownerType,
        campaignId: z.string().optional(),
      })
      .strict(),
    output: z.number(),
  },
  {
    name: 'scores.share',
    description:
      'Moves score from the owner to a destination owner, less the ShareScoreFee config. The destination is found by destinationOwnerId, or by email, phone or code. Returns "success". Needs loyaltyShareScore when called as a user.',
    kind: 'write',
    field: 'shareScore',
    args: {
      ownerType: 'String',
      ownerId: 'String',
      score: 'Float',
      destinationOwnerId: 'String',
      destinationPhone: 'String',
      destinationEmail: 'String',
      destinationCode: 'String',
      campaignId: 'String',
    },
    input: z
      .object({
        ownerType,
        ownerId: z.string().min(1),
        score: z.number().positive(),
        destinationOwnerId: z.string().optional(),
        destinationPhone: z.string().optional(),
        destinationEmail: z.string().optional(),
        destinationCode: z.string().optional(),
        campaignId: z.string().optional(),
      })
      .strict(),
    output: z.string(),
  },

  // Loyalty accounts
  {
    name: 'accounts.list',
    description:
      'Lists loyalty accounts, 20 per page by default. Filter by ownerType, status, or accountTypeId. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Needs scoreLogView. Read-only.',
    kind: 'read',
    field: 'loyaltyAccounts',
    args: {
      ownerType: 'String',
      status: 'String',
      accountTypeId: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        ownerType: ownerType.optional(),
        status: z.string().optional(),
        accountTypeId: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: listOf(LoyaltyAccount),
  },
  {
    name: 'accounts.get',
    description:
      'Reads the loyalty account of one owner, with its balance per account type. Returns null until the owner has an account, which opens on the first score change. Needs scoreLogView. Read-only.',
    kind: 'read',
    field: 'loyaltyAccountOfOwner',
    args: { ownerType: 'String!', ownerId: 'String!' },
    input: z
      .object({
        ownerType,
        ownerId: z.string().min(1),
      })
      .strict(),
    output: LoyaltyAccount.nullable(),
  },
]);
