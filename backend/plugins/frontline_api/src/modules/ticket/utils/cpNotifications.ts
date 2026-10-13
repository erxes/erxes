import debug from 'debug';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { TICKET_STATUS_TYPES } from '@/ticket/constants/types';

const debugError = debug('erxes:ticket:error');

const CP_PREFIX = 'cp:';

const MESSAGE_MAX = 160;

const CLOSING_STATUS_TYPES = new Set<number>([
  TICKET_STATUS_TYPES.RESOLVED,
  TICKET_STATUS_TYPES.CLOSED,
]);

export type PortalOwner = { cpUserId: string; clientPortalId: string };

export type TicketNotificationInput = {
  ticket: { _id: string; name?: string; number?: string; createdBy?: string };
  eventType: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actorId?: string;
  owner?: PortalOwner;
};

export const portalAuthorId = (value?: string | null): string | null =>
  value?.startsWith(CP_PREFIX) ? value.slice(CP_PREFIX.length) : null;

export const isPortalAuthor = (value?: string | null): boolean =>
  !!portalAuthorId(value);

const stripTags = (value: string): string => {
  const parts: string[] = [];
  let cursor = 0;

  while (cursor < value.length) {
    const open = value.indexOf('<', cursor);
    const close = open === -1 ? -1 : value.indexOf('>', open + 1);

    if (close === -1) {
      break;
    }

    parts.push(value.slice(cursor, open), ' ');
    cursor = close + 1;
  }

  parts.push(value.slice(cursor));

  return parts.join('');
};

export const notificationText = (value?: string | null): string => {
  const text = stripTags(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > MESSAGE_MAX
    ? `${text.slice(0, MESSAGE_MAX - 1)}…`
    : text;
};

export const isClosingStatus = (statusType?: number | null): boolean =>
  !!statusType && CLOSING_STATUS_TYPES.has(statusType);

const findPortalOwner = async (
  subdomain: string,
  createdBy?: string,
): Promise<PortalOwner | null> => {
  const id = portalAuthorId(createdBy);

  if (!id) {
    return null;
  }

  for (const input of [{ id }, { erxesCustomerId: id }]) {
    const user = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
      input,
      defaultValue: null,
    });

    if (user?._id && user?.clientPortalId) {
      return { cpUserId: user._id, clientPortalId: user.clientPortalId };
    }
  }

  return null;
};

export const notifyTicketOwner = async (
  subdomain: string,
  input: TicketNotificationInput,
): Promise<void> => {
  const { ticket, actorId } = input;

  if (actorId && ticket.createdBy && actorId === ticket.createdBy) {
    return;
  }

  try {
    const owner =
      input.owner ?? (await findPortalOwner(subdomain, ticket.createdBy));

    if (!owner) {
      return;
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'cpNotifications',
      action: 'create',
      input: {
        cpUserIds: [owner.cpUserId],
        clientPortalId: owner.clientPortalId,
        eventType: input.eventType,
        data: {
          title: input.title,
          message: input.message,
          type: input.type ?? 'info',
          contentType: 'frontline:ticket',
          contentTypeId: ticket._id,
          priority: input.priority ?? 'medium',
          action: 'openTicket',
          kind: 'user',
          metadata: { ticketId: ticket._id, number: ticket.number },
        },
      },
      defaultValue: null,
    });
  } catch (e) {
    debugError(
      `Could not notify the portal about ticket ${ticket._id}: ${
        e instanceof Error ? e.message : e
      }`,
    );
  }
};
