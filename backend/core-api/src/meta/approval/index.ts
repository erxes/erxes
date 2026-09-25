import { TApprovalConfig } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { AUTOMATION_CHANGE_TYPES, automationChangeAppliers } from './automations';

export const approval: TApprovalConfig<IModels> = {
  changeTypes: [
    {
      type: AUTOMATION_CHANGE_TYPES.OWNERSHIP_TRANSFER,
      label: 'Automation ownership transfer',
    },
  ],

  appliers: {
    ...automationChangeAppliers,
  },

  generateModels,
};
