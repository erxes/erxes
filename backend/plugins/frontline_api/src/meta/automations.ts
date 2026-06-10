import { facebookConstants } from '@/integrations/facebook/meta/automation/constants';
import { facebookAutomationWorkers } from '@/integrations/facebook/meta/automation/workers';
import { instagramConstants } from '@/integrations/instagram/meta/constants';
import { instagramAutomationWorkers } from '@/integrations/instagram/meta/automation/workers';
import { inboxAutomationConstants } from '@/inbox/meta/automation/constants';
import { inboxAutomationWorkers } from '@/inbox/meta/automation/workers';

import {
  AutomationConfigs,
  createCoreModuleProducerHandler,
  TAutomationProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { ticketAutomationProducers } from '~/modules/ticket/meta/automations';
import { ticketsAutomationContants } from '~/modules/ticket/meta/automations/ticketAutomationsConstants';

const modules = {
  facebook: facebookAutomationWorkers,
  instagram: instagramAutomationWorkers,
  inbox: inboxAutomationWorkers,
  tickets: ticketAutomationProducers,
};

export const automations = {
  constants: {
    actions: [
      ...facebookConstants.actions,
      ...instagramConstants.actions,
      ...ticketsAutomationContants.actions,
    ],
    triggers: [
      ...inboxAutomationConstants.triggers,
      ...facebookConstants.triggers,
      ...instagramConstants.triggers,
      ...ticketsAutomationContants.triggers,
    ],
    bots: [...facebookConstants.bots, ...instagramConstants.bots],
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
  checkTargetMatch: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.CHECK_TARGET_MATCH,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),
  generateAiContext: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.GENERATE_AI_CONTEXT,
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
} as AutomationConfigs;
