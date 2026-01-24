import {
  AutomationConfigs,
  createCoreModuleProducerHandler,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { operationAutomationHandlers } from './automations/automationHandlers';
import { operationAutomationConstants } from './automations/constants';

const modules = {
  operation: operationAutomationHandlers,
};

export default {
  constants: {
    triggers: [...operationAutomationConstants.triggers],
    actions: [...operationAutomationConstants.actions],
  },

  receiveActions: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.RECEIVE_ACTIONS,
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
