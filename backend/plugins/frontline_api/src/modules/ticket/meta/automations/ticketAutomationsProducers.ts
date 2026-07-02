import {
  getSetPropertySelector,
  setProperty,
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

  setProperties: async (
    data: TAutomationProducersInput[TAutomationProducers.SET_PROPERTIES],
    context: TCoreModuleProducerContext<IModels>,
  ) => {
    const { models, subdomain } = context;
    const { action, execution, targetType } = data;
    const { module, rules, setPropertyTarget } = action.config;

    const selector = await getSetPropertySelector({
      subdomain,
      module,
      execution,
      targetType,
      relation: setPropertyTarget?.relation,
    });

    return await setProperty({
      models,
      subdomain,
      module,
      rules,
      execution,
      setPropertyTarget,
      selector,
      fetchItems: async (itemSelector) =>
        await models.Ticket.find(itemSelector).lean(),
      update: async ({ selector: itemSelector, modifier }) =>
        await models.Ticket.updateMany(itemSelector, modifier),
      targetType,
    });
  },

  checkTargetMatch: async (
    input: TAutomationProducersInput[TAutomationProducers.CHECK_TARGET_MATCH],
    context: TCoreModuleProducerContext<IModels>,
  ) => {
    const { moduleName, collectionType, targetId, selector } = input;

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
