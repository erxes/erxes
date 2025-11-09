import { AutomationConfigs } from 'erxes-api-shared/src/core-modules/automations/types';
import { generateModels } from '~/connectionResolvers';
import { facebookConstants } from '@/integrations/facebook/meta/automation/constants';
import { facebookAutomationWorkers } from '@/integrations/facebook/meta/automation/workers';
import {
  IAutomationReceiveActionData,
  ICheckTriggerData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const modules = {
  facebook: facebookAutomationWorkers,
};

type ModuleKeys = keyof typeof modules;

const generateAdditionalAttributes = async (
  subdomain: string,
  contentType: string,
  parents: { label: string; name: string }[],
) => {
  const fields = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'fields',
    action: 'fieldsCombinedByContentType',
    input: { contentType },
    defaultValue: [],
  });

  let generatedFields = fields;

  for (const parent of parents) {
    generatedFields = generatedFields.map((field) => ({
      ...field,
      name: `${parent.name}.${field.name}`,
      label: `${parent.label} ${field.label}`,
    }));
  }

  return generatedFields;
};

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

  receiveActions: async ({ subdomain, data }) => {
    const {
      moduleName,
      ...args
    }: { moduleName: string } & IAutomationReceiveActionData = data;
    const models = await generateModels(subdomain);
    const context = { models, subdomain };

    return modules[moduleName as ModuleKeys].receiveActions(
      context,
      createActionData(args),
    );
  },

  checkCustomTrigger: async ({ subdomain, data }) => {
    const { moduleName, ...props }: { moduleName: string } & ICheckTriggerData =
      data;
    const models = await generateModels(subdomain);
    const context = { models, subdomain };

    return modules[moduleName as ModuleKeys].checkCustomTrigger(context, props);
  },
  getAdditionalAttributes: async ({ subdomain }) => {
    const customerFields = await generateAdditionalAttributes(
      subdomain,
      'core:customer',
      [{ label: 'Customer', name: 'customer' }],
    );
    const usersFields = await generateAdditionalAttributes(
      subdomain,
      'core:user',
      [
        { label: 'Created by', name: 'createdBy' },
        { label: 'Modified by', name: 'modifiedBy' },
        { label: 'Assigned to', name: 'assignedUserIds' },
        { label: 'Watched users', name: 'watchedUserIds' },
      ],
    );
    return [...customerFields, ...usersFields];
  },
} as AutomationConfigs;
