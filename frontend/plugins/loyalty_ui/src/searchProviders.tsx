import { IconAward } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TCampaignNode = {
  _id: string;
  title?: string | null;
  createdAt?: string | null;
};

const voucherCampaignsSearchProvider = defineSearchProvider<TCampaignNode>({
  key: 'loyalty-voucher-campaigns',
  label: 'Voucher campaigns',
  icon: IconAward,
  order: 210,
  selections: [
    {
      alias: 'gs_loyalty_voucher_campaigns',
      field: 'voucherCampaigns',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id title createdAt } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_voucher_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
    createdAt: campaign.createdAt ?? undefined,
    path: `/settings/loyalty/config/voucher?editVoucherId=${campaign._id}`,
  }),
});

const couponCampaignsSearchProvider = defineSearchProvider<TCampaignNode>({
  key: 'loyalty-coupon-campaigns',
  label: 'Coupon campaigns',
  icon: IconAward,
  order: 220,
  selections: [
    {
      alias: 'gs_loyalty_coupon_campaigns',
      field: 'couponCampaigns',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id title createdAt } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_coupon_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
    createdAt: campaign.createdAt ?? undefined,
    path: `/settings/loyalty/config/coupon?editCouponId=${campaign._id}`,
  }),
});

const assignmentCampaignsSearchProvider = defineSearchProvider<TCampaignNode>({
  key: 'loyalty-assignment-campaigns',
  label: 'Assignment campaigns',
  icon: IconAward,
  order: 230,
  selections: [
    {
      alias: 'gs_loyalty_assignment_campaigns',
      field: 'assignmentCampaigns',
      args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id title createdAt } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_assignment_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
    createdAt: campaign.createdAt ?? undefined,
    path: `/settings/loyalty/config/assignment?editAssignmentId=${campaign._id}`,
  }),
});

const scoreCampaignsSearchProvider = defineSearchProvider<TCampaignNode>({
  key: 'loyalty-score-campaigns',
  label: 'Score campaigns',
  icon: IconAward,
  order: 240,
  selections: [
    {
      alias: 'gs_loyalty_score_campaigns',
      field: 'scoreCampaigns',
      args: 'searchValue: $searchValue, status: "all", limit: $limit, cursor: $cursor, direction: forward, orderBy: $orderBy',
      body: '{ list { _id title createdAt } totalCount pageInfo { hasNextPage endCursor } }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_score_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
    createdAt: campaign.createdAt ?? undefined,
    path: `/settings/loyalty/config/score?editScoreId=${campaign._id}`,
  }),
});

const createCampaignSearchProvider = (
  key: string,
  label: string,
  field: 'lotteryCampaigns' | 'spinCampaigns' | 'donateCampaigns',
  queryParameter: 'editLotteryId' | 'editSpinId' | 'editDonationId',
  route: 'lottery' | 'spin' | 'donate',
  order: number,
) =>
  defineSearchProvider<TCampaignNode>({
    key,
    label,
    icon: IconAward,
    order,
    selections: [
      {
        alias: `gs_loyalty_${route}_campaigns`,
        field,
        args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, orderBy: $orderBy',
        body: '{ list { _id title createdAt } totalCount pageInfo { hasNextPage endCursor } }',
      },
    ],
    select: (payload) =>
      readCursorList<TCampaignNode>(payload, `gs_loyalty_${route}_campaigns`),
    toItem: (campaign) => ({
      id: campaign._id,
      title: campaign.title || UNNAMED,
      createdAt: campaign.createdAt ?? undefined,
      path: `/settings/loyalty/config/${route}?${queryParameter}=${campaign._id}`,
    }),
  });

const lotteryCampaignsSearchProvider = createCampaignSearchProvider(
  'loyalty-lottery-campaigns',
  'Lottery campaigns',
  'lotteryCampaigns',
  'editLotteryId',
  'lottery',
  241,
);

const spinCampaignsSearchProvider = createCampaignSearchProvider(
  'loyalty-spin-campaigns',
  'Spin campaigns',
  'spinCampaigns',
  'editSpinId',
  'spin',
  242,
);

const donateCampaignsSearchProvider = createCampaignSearchProvider(
  'loyalty-donate-campaigns',
  'Donate campaigns',
  'donateCampaigns',
  'editDonationId',
  'donate',
  243,
);

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  voucherCampaignsSearchProvider,
  couponCampaignsSearchProvider,
  assignmentCampaignsSearchProvider,
  scoreCampaignsSearchProvider,
  lotteryCampaignsSearchProvider,
  spinCampaignsSearchProvider,
  donateCampaignsSearchProvider,
];
