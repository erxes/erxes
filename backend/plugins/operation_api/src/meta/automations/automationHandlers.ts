import {
  replacePlaceHolders,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { createTriageAction } from './actions/createTriageAction';

export const operationAutomationHandlers = {
  receiveActions: async (
    {
      action,
      execution,
      actionType,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    // Handle triage creation action
    if (collectionType === 'triage') {
      return await createTriageAction({
        models,
        subdomain,
        action,
        execution,
      });
    }

    return null;
  },
  replacePlaceHolders: async (
    data: TAutomationProducersInput[TAutomationProducers.REPLACE_PLACEHOLDERS],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { config, target } = data;

    return await replacePlaceHolders({
      models,
      subdomain,
      actionData: config,
      target: target || {},
    });
  },
};
