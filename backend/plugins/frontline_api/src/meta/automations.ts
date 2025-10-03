import { AutomationConfigs } from 'erxes-api-shared/src/core-modules/automations/types';
import { generateModels } from '~/connectionResolvers';
import { facebookConstants } from '@/integrations/facebook/meta/automation/constants';
import { facebookAutomationWorkers } from '@/integrations/facebook/meta/automation/workers';
import {
  IAutomationReceiveActionData,
  ICheckTriggerData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';

const modules = {
  facebook: facebookAutomationWorkers,
};

type ModuleKeys = keyof typeof modules;

function createActionData(
  args: IAutomationReceiveActionData,
): IAutomationReceiveActionData {
  const {
    action,
    execution,
    actionType,
    collectionType,
    triggerType,
    ...restArgs
  } = args;

  return {
    action,
    execution,
    actionType,
    collectionType,
    triggerType,
    ...restArgs,
  };
}

export default {
  constants: {
    actions: [...facebookConstants.actions],
    triggers: [...facebookConstants.triggers],
    bots: [...facebookConstants.bots],
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

    return modules[moduleName as ModuleKeys].receiveActions(
      context,
      createActionData(args),
    );
  },

  checkCustomTrigger: async (
    { subdomain },
    { moduleName, ...props }: { moduleName: string } & ICheckTriggerData,
  ) => {
    const models = await generateModels(subdomain);
    const context = { models, subdomain };

    return modules[moduleName as ModuleKeys].checkCustomTrigger(context, props);
  },
} as AutomationConfigs;
