import {
  AutomationConfigs,
  createCoreModuleProducerHandler,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { salesAutomationHandlers } from '~/modules/sales/meta/automations/automationHandlers';
import { salesAutomationContants } from '~/modules/sales/meta/automations/constants';
import { checkTriggerDealStageProbality } from '~/modules/sales/meta/automations/trigger/checkStageProbalityTrigger';

const modules = {
  sales: salesAutomationHandlers,
};

export default {
  constants: {
    triggers: [...salesAutomationContants.triggers],
    actions: [...salesAutomationContants.actions],
  },
  receiveActions: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.RECEIVE_ACTIONS,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),

  // checkCustomTrigger: createCoreModuleProducerHandler({
  //   moduleName: 'automations',
  //   modules,
  //   methodName: TAutomationProducers.CHECK_CUSTOM_TRIGGER,
  //   extractModuleName: (input) => input.moduleName,
  //   generateModels,
  // }),
  checkCustomTrigger: async ({
    subdomain,
    data: { collectionType, relationType, target, config },
  }: any) => {
    console.log({ collectionType, relationType });
    const models = await generateModels(subdomain);
    console.log({ models });
    if (collectionType === 'deal' && relationType === 'probability') {
      return await checkTriggerDealStageProbality({
        models,
        target: target as any,
        config,
      });
    }

    return false;
  },
  setProperties: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.SET_PROPERTIES,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),
  replacePlaceHolders: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.REPLACE_PLACEHOLDERS,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),
} as AutomationConfigs;
