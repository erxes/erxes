import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

export const campaignSchema = {
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  startDate: { type: Date, label: 'Start Date' },
  endDate: { type: Date, label: 'End Date' },
  status: { type: String, label: 'Status', enum: CAMPAIGN_STATUS.ALL },
};
