import {
  AutomationConfigs,
  AutomationProducers,
  TAutomationProducers,
} from 'erxes-api-shared/src/core-modules/automations/types';
import { LOYALTIES_AUTOMATIONS_CONSTANTS } from './constants';
import { createCoreModuleProducerHandler } from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { scoreAutomationProducers } from './score/producers';

const modules: Record<string, AutomationProducers> = {
  score: scoreAutomationProducers,
  voucher: {},
  spin: {},
};

export const automationMeta = {
  constants: LOYALTIES_AUTOMATIONS_CONSTANTS,

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
} as AutomationConfigs;
