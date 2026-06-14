import {
  AutomationConfigs,
  createCoreModuleProducerHandler,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { operationAutomationHandlers } from '~/modules/automations/automationHandlers';
import { operationAutomationConstants } from '~/modules/automations/constants';

const modules = {
  task: operationAutomationHandlers,
  project: operationAutomationHandlers,
  team: operationAutomationHandlers,
};

export const automations: AutomationConfigs = {
  constants: operationAutomationConstants,

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
};
