import {
  IAutomationReceiveActionData,
  ICheckTriggerData,
} from 'erxes-api-shared/core-types';
import { generateModels } from '~/connectionResolvers';
import { salesAutomationHandlers } from '~/modules/sales/meta/automations/automationHandlers';
import { salesAutomationContants } from '~/modules/sales/meta/automations/constants';

const modules = {
  sales: salesAutomationHandlers,
};

type ModuleKeys = keyof typeof modules;

export default {
  constants: {
    triggers: [...salesAutomationContants.triggers],
    actions: [...salesAutomationContants.actions],
  },
  receiveActions: async (
    { subdomain },
    {
      moduleName,
      ...args
    }: { moduleName: string } & IAutomationReceiveActionData,
  ) => {
    const models = await generateModels(subdomain);
    const context = { models, subdomain };

    return modules[moduleName as ModuleKeys].receiveActions(context, args);
  },

  checkCustomTrigger: async (
    { subdomain },
    { moduleName, ...props }: { moduleName: string } & ICheckTriggerData,
  ) => {
    const models = await generateModels(subdomain);
    const context = { models, subdomain };

    return modules[moduleName as ModuleKeys].checkCustomTrigger(context, props);
  },
};
