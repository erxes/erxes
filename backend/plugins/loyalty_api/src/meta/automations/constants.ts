import {
  AutomationConstants,
  TAutomationRuntimeOutputDefinition,
} from 'erxes-api-shared/core-modules';
import { TierChangedTarget } from './types';

const TIER_CHANGED_OUTPUT: TAutomationRuntimeOutputDefinition<TierChangedTarget> =
  {
    variables: [
      { key: '_id', label: 'Owner ID', field: '_id' },
      { key: 'ownerType', label: 'Owner type' },
      {
        key: 'customerId',
        label: 'Customer',
        exposure: 'reference',
        field: 'customerId',
        referenceType: 'core:customer',
      },
      { key: 'accountTypeName', label: 'Wallet' },
      { key: 'fromTier', label: 'Previous tier' },
      { key: 'toTier', label: 'New tier' },
      { key: 'direction', label: 'Direction (up / down)' },
    ],
  };

export const LOYALTIES_AUTOMATIONS_CONSTANTS: AutomationConstants = {
  triggers: [
    {
      moduleName: 'score',
      collectionName: 'tier',
      icon: 'IconCrown',
      label: 'Tier changed',
      description:
        'Start this workflow when a member moves to another tier of a wallet.',
      isCustom: true,
      // Reaching a tier again (after a reset, a drop) is a new event.
      reEnrollment: true,
      output: TIER_CHANGED_OUTPUT,
    },
  ],
  actions: [
    {
      moduleName: 'voucher',
      collectionName: 'voucher',
      icon: 'IconTagPlus',
      label: 'Issue voucher',
      description: 'Issue a voucher',
    },
    {
      moduleName: 'score',
      collectionName: 'score',
      icon: 'IconMoneybagPlus',
      label: 'Adjust score',
      description: 'Give loyalty points for a purchase',
      // Filled by the trigger's own plugin (its `actionInputs`); points paid
      // with are recorded by the selling side, not by this action.
      inputs: [
        { key: 'totalAmount', label: 'Total amount', type: 'number' },
        { key: 'paidAmount', label: 'Paid amount', type: 'number' },
        { key: 'items', label: 'Purchased items', type: 'array' },
      ],
    },
    {
      moduleName: 'score',
      collectionName: 'tier',
      icon: 'IconStairs',
      label: 'Set tier',
      description: "Set a loyalty tier on the owner's account",
      // With amount bands the tier comes from the purchase; the trigger's own
      // plugin fills it (its `actionInputs`).
      inputs: [{ key: 'totalAmount', label: 'Total amount', type: 'number' }],
    },
    {
      moduleName: 'spin',
      collectionName: 'spin',
      icon: 'IconTrophy',
      label: 'Award spin',
      description: 'Give a spin reward',
    },
  ],
};
