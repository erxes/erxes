import { TTierBandsConfig } from '@/score/services/tierBands';
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
  ownerType?: LoyaltyOwnerType;
  details?: Record<string, unknown>;
};

// What the tier-changed trigger hands to a run: the owner whose tier moved.
export type TierChangedTarget = {
  _id: string;
  ownerType: LoyaltyOwnerType;
  customerId?: string;
  accountId: string;
  accountTypeId: string;
  accountTypeName: string;
  fromTier: string | null;
  toTier: string | null;
  direction: TTierDirection;
};

export type TTierDirection = 'up' | 'down';

export type TierChangedTriggerConfig = {
  accountTypeId?: string;
  // Empty: any tier.
  toTier?: string;
  direction?: TTierDirection | 'any';
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

export type SetTierActionConfig = TTierBandsConfig & {
  attribution?: string;
  accountTypeId?: string;
  // A tier key of the account type; empty clears the tier. Unused with bands.
  tier?: string;
  // With bands, a purchase never moves the owner to a lower tier.
  onlyUpgrade?: boolean;
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
