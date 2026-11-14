import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  getSetPropertySelector,
  setProperty,
  TCoreModuleProducerContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { publishTicketChanged } from '~/modules/ticket/utils/publishTicketChanged';
import { prepareTicketPropertyWrite } from '~/modules/ticket/meta/automations/ticketPropertyWrites';
import { createTicketAction } from '~/modules/ticket/meta/automations/actions/createTicketAction';
import {
  isTicketStatusChanged,
  TICKET_STATUS_CHANGED_RELATION,
} from '~/modules/ticket/meta/automations/trigger/checkStatusChangedTrigger';
import {
  matchTicketSlaEvent,
  TICKET_SLA_RELATION,
} from '~/modules/ticket/meta/automations/trigger/checkSlaTrigger';

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

    return buildFailedAction(
      `Ticket automations do not handle "${input.collectionType}"`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  },

  checkCustomTrigger: async ({
    collectionType,
    relationType,
    target,
    config,
    eventUpdateDescription,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) =>
    collectionType === 'tickets' &&
    ((relationType === TICKET_STATUS_CHANGED_RELATION &&
      isTicketStatusChanged({ target, config, eventUpdateDescription })) ||
      (relationType === TICKET_SLA_RELATION &&
        !!matchTicketSlaEvent({ target, config, eventUpdateDescription }))),

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
      targetPath: setPropertyTarget?.targetPath,
      targetActionId: action.targetActionId,
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
      update: async ({ selector: itemSelector, modifier, item }) => {
        const result = await models.Ticket.updateMany(
          itemSelector,
          await prepareTicketPropertyWrite({
            models,
            modifier,
            item,
            target: (execution.target || {}) as Record<string, unknown>,
          }),
        );

        // Priority or status may have moved; the SLA follows.
        if (item?._id) {
          await models.Ticket.syncSla(String(item._id), subdomain).catch(
            (error) =>
              console.error(`Ticket ${item._id} SLA sync failed:`, error),
          );

          const updated = await models.Ticket.findOne({ _id: item._id }).lean();

          if (updated) {
            publishTicketChanged(updated, 'update');
          }
        }

        return result;
      },
      targetType,
    });
  },
};
