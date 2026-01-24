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
    if (collectionType === 'triage' && action.config.method === 'create') {
      return await createTriageAction({
        models,
        subdomain,
        action,
        execution,
      });
    }

    throw new Error(
      `Unknown action type: ${collectionType} with method ${action.config.method}`,
    );
  },

  replacePlaceHolders: async (
    data: TAutomationProducersInput[TAutomationProducers.REPLACE_PLACEHOLDERS],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    const { config, target } = data;

    // Simple placeholder replacement for operation module
    return await replacePlaceHolders({
      models,
      subdomain,
      actionData: config,
      target: {
        ...target,
        // Add default placeholders for common fields
        ['createdBy.email']: '-',
        ['createdBy.phone']: '-',
        ['team.name']: '-',
      },
    });
  },
};
