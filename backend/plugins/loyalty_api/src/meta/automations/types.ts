import {
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';

export type LoyaltyOwnerType = 'customer' | 'company' | 'user';

export type LoyaltyAutomationOwner = {
  ownerType: LoyaltyOwnerType;
  ownerId: string;
};

export type LoyaltyAutomationTarget = Record<string, unknown> & {
  _id?: string;
  customerId?: string;
  birthDate?: string | Date;
  details?: {
    birthDate?: string | Date;
  };
};

export type LoyaltyScoreAction = 'add' | 'subtract';

export type LoyaltyReceiveActionsInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

export type LoyaltyAutomationExecution =
  LoyaltyReceiveActionsInput['execution'];

export type LoyaltyAutomationAction = LoyaltyReceiveActionsInput['action'];

export type AdjustScoreActionConfig = {
  campaignId?: string;
  action?: LoyaltyScoreAction;
  attribution?: string;
  ownerType?: LoyaltyOwnerType;
  // Earning rows this automation turns on; every row when absent (older
  // automations).
  earnRowKeys?: string[];
};

export type SetTierActionConfig = {
  attribution?: string;
  accountTypeId?: string;
  // A tier key of the account type; empty clears the tier.
  tier?: string;
};

export type IssueVoucherActionConfig = {
  voucherCampaignId?: string;
  ownerType?: LoyaltyOwnerType;
  ownerId?: string;
  ownerIds?: string[];
  attribution?: string;
  customRule?: {
    duration?: 'month' | 'week' | 'day' | 'minute';
  };
};

export type AwardSpinActionConfig = {
  spinCampaignId?: string;
  ownerType?: LoyaltyOwnerType;
  ownerId?: string;
  ownerIds?: string[];
  attribution?: string;
};
