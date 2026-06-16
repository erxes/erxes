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
      description: 'Add or subtract loyalty score',
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
