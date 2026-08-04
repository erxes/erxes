import { facebookConstants } from '@/integrations/facebook/meta/automation/constants';
import { facebookAutomationWorkers } from '@/integrations/facebook/meta/automation/workers';
import { instagramConstants } from '@/integrations/instagram/meta/constants';
import { instagramAutomationWorkers } from '@/integrations/instagram/meta/automation/workers';
import { inboxAutomationConstants } from '@/inbox/meta/automation/constants';
import { inboxAutomationWorkers } from '@/inbox/meta/automation/workers';
import { discordConstants } from '@/integrations/discord/meta/automation/constants';
import { discordAutomationWorkers } from '@/integrations/discord/meta/automation/workers';
import {
  frontlineAiKnowledgeProvider,
  FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY,
} from '@/knowledgebase/meta/automations';

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
  discord: discordAutomationWorkers,
  knowledgebase: frontlineAiKnowledgeProvider,
};

export const automations = {
  constants: {
    actions: [
      ...inboxAutomationConstants.actions,
      ...facebookConstants.actions,
      ...instagramConstants.actions,
      ...ticketsAutomationContants.actions,
      ...discordConstants.actions,
    ],
    triggers: [
      ...inboxAutomationConstants.triggers,
      ...facebookConstants.triggers,
      ...instagramConstants.triggers,
      ...ticketsAutomationContants.triggers,
      ...discordConstants.triggers,
    ],
    bots: [...facebookConstants.bots, ...instagramConstants.bots],
    ai: {
      knowledgeSources: [
        {
          key: FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY,
          label: 'Knowledge base articles',
          moduleName: 'knowledgebase',
          sourceSelector: 'remote-module',
        },
      ],
    },
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
  loadAiKnowledgeDocumentBatch: createCoreModuleProducerHandler({
    moduleName: 'automations',
    modules,
    methodName: TAutomationProducers.LOAD_AI_KNOWLEDGE_DOCUMENT_BATCH,
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
