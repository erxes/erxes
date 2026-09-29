import { AutomationConstants } from 'erxes-api-shared/core-modules';

export const LOYALTIES_AUTOMATIONS_CONSTANTS: AutomationConstants = {
  triggers: [
    {
      // type: 'loyalty:reward',
      moduleName: 'voucher',
      collectionName: 'reward',
      icon: 'IconAward',
      label: 'Reward',
      description: 'Start this workflow when a loyalty reward event occurs.',
      isCustom: true,
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
