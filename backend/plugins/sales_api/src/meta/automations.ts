import {
  AutomationConfigs,
  createCoreModuleProducerHandler,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { posAutomationHandlers } from '~/modules/pos/meta/automations/automationHandlers';
import { posAutomationConstants } from '~/modules/pos/meta/automations/constants';
import { salesAutomationHandlers } from '~/modules/sales/meta/automations/automationHandlers';
import { salesAutomationContants } from '~/modules/sales/meta/automations/constants';
import { findSalesObject } from '~/modules/sales/meta/automations/findObject';
const modules = {
  sales: salesAutomationHandlers,
  pos: posAutomationHandlers,
};

export default {
  constants: {
    triggers: [
      ...salesAutomationContants.triggers,
      ...posAutomationConstants.triggers,
    ],
    actions: [
      ...salesAutomationContants.actions,
      ...posAutomationConstants.actions,
    ],
    findObjectTargets: [...salesAutomationContants.findObjectTargets],
    setPropertyTargets: [...salesAutomationContants.setPropertyTargets],
  },
  receiveActions: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.RECEIVE_ACTIONS,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),

  checkCustomTrigger: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.CHECK_CUSTOM_TRIGGER,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),
  setProperties: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.SET_PROPERTIES,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),

  checkTargetMatch: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.CHECK_TARGET_MATCH,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),

  findObject: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return await findSalesObject(models, data);
  },
} as AutomationConfigs;
