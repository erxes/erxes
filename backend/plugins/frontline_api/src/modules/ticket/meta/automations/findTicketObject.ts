import {
  TAutomationFindObjectResult,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { FRONTLINE_TICKET_TARGET_SOURCE_TYPE } from '~/modules/ticket/meta/automations/ticketAutomationsConstants';
import { isClosingStatus } from '~/modules/ticket/utils/cpNotifications';

type TFindObjectData =
  TAutomationProducersInput[TAutomationProducers.FIND_OBJECT];

const generateTicketFilter = (field: string, value: string) => {
  if (field === '_id') {
    return { _id: value };
  }

  if (field === 'number') {
    return { number: value };
  }

  return null;
};

export const findTicketObject = async (
  models: IModels,
  data: TFindObjectData,
): Promise<TAutomationFindObjectResult> => {
  const { objectType, field, value } = data;

  if (objectType !== FRONTLINE_TICKET_TARGET_SOURCE_TYPE) {
    throw new Error(`Unsupported frontline find object type: ${objectType}`);
  }

  const filter = generateTicketFilter(field, value);

  if (!filter) {
    throw new Error(`Unsupported lookup field "${field}" for "Ticket"`);
  }

  // An empty value matches nothing rather than the first ticket.
  const doc = value ? await models.Ticket.findOne(filter).lean() : null;

  return {
    found: !!doc,
    objectType,
    objectId: doc?._id ? String(doc._id) : undefined,
    object: doc || null,
    matchedBy: { field, value },
    acceptsFollowUp: doc ? !isClosingStatus(doc.statusType) : undefined,
  };
};
