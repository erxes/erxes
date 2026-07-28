import type { AutomationConfigs } from 'erxes-api-shared/core-modules';
import { LOYALTIES_AUTOMATIONS_CONSTANTS } from './constants';
import {
  createCoreModuleProducerHandler,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { scoreAutomationProducers } from './score/producers';
import { spinAutomationProducers } from './spin/producers';
import { voucherAutomationProducers } from './voucher/producers';

const modules = {
  score: scoreAutomationProducers,
  voucher: voucherAutomationProducers,
  spin: spinAutomationProducers,
};

export const automationMeta: AutomationConfigs = {
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
};
