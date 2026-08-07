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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id title } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_voucher_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id title } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_coupon_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id title } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_assignment_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
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
      args: 'searchValue: $searchValue, limit: $limit',
      body: '{ list { _id title } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TCampaignNode>(payload, 'gs_loyalty_score_campaigns'),
  toItem: (campaign) => ({
    id: campaign._id,
    title: campaign.title || UNNAMED,
    path: '/settings/loyalty/config/score',
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  voucherCampaignsSearchProvider,
  couponCampaignsSearchProvider,
  assignmentCampaignsSearchProvider,
  scoreCampaignsSearchProvider,
];
