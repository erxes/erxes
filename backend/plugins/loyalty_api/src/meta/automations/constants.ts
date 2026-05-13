import { AutomationConstants } from 'erxes-api-shared/core-modules';

export const LOYALTIES_AUTOMATIONS_CONSTANTS: AutomationConstants = {
  triggers: [
    {
      type: 'loyalties:reward',
      icon: 'IconAward',
      label: 'Reward',
      description:
        'Start with a blank workflow that enrolls and is triggered off reward',
      isCustom: true,
    },
  ],
  actions: [
    {
      type: 'loyalties:voucher.create',
      icon: 'IconTagPlus',
      label: 'Create voucher',
      description: 'Create voucher',
    },
    {
      type: 'loyalties:score.create',
      icon: 'IconMoneyBagPlus',
      label: 'Change Score',
      description: 'Change Score',
    },
    {
      type: 'loyalties:spin.create',
      icon: 'IconTrophy',
      label: 'Create Spin',
      description: 'Create Spin',
    },
  ],
};
