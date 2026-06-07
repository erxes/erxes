import {
  TCoreModuleProducerContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { createTicketAction } from '~/modules/ticket/meta/automations/actions/createTicketAction';

export const ticketAutomationProducers = {
  receiveActions: async (
    input: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    context: TCoreModuleProducerContext<IModels>,
  ) => {
    if (input.collectionType === 'tickets') {
      return await createTicketAction({
        models: context.models,
        subdomain: context.subdomain,
        action: input.action,
        execution: input.execution,
      });
    }

    return { result: null };
  },

  checkCustomTrigger: async () => false,

  checkTargetMatch: async (
    input: TAutomationProducersInput[TAutomationProducers.CHECK_TARGET_MATCH],
    context: TCoreModuleProducerContext<IModels>,
  ) => {
    const { moduleName, collectionType, targetId, selector } = input;
    console.log({ moduleName, collectionType, targetId, selector });

    if (collectionType === 'tickets' && moduleName === 'tickets') {
      return Boolean(
        await context.models.Ticket.exists({
          $and: [{ _id: targetId }, selector],
        }),
      );
    }

    return false;
  },
};
