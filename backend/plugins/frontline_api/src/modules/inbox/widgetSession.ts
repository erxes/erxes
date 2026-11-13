import { createHmac } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';

export const WIDGET_SESSION_HEADER = 'erxes-widget-token';

const AUDIENCE = 'erxes-widget';
const SESSION_TTL = '90d';

/**
 * Who a widget request speaks for. It comes only from a token this server
 * signed, never from request arguments.
 */
export type TWidgetSession = {
  integrationId: string;
  customerId?: string;
  visitorId?: string;
};

type TRequestLike = {
  headers?: Record<string, string | string[] | undefined>;
};

// Derived from the staff secret so a widget token can never pass as a staff one.
const widgetSecret = () => {
  const base = process.env.JWT_TOKEN_SECRET;

  if (!base && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_TOKEN_SECRET must be set');
  }

  return createHmac('sha256', base || 'SECRET')
    .update(AUDIENCE)
    .digest('hex');
};

export const signWidgetSession = ({
  integrationId,
  customerId,
  visitorId,
}: TWidgetSession) =>
  jwt.sign({ integrationId, customerId, visitorId }, widgetSecret(), {
    audience: AUDIENCE,
    expiresIn: SESSION_TTL,
  });

const isSession = (value: unknown): value is TWidgetSession =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as TWidgetSession).integrationId === 'string' &&
  Boolean(
    (value as TWidgetSession).customerId || (value as TWidgetSession).visitorId,
  );

export const readWidgetSession = (
  req?: TRequestLike | null,
): TWidgetSession | null => {
  const token = req?.headers?.[WIDGET_SESSION_HEADER];

  if (typeof token !== 'string' || !token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, widgetSecret(), { audience: AUDIENCE });

    if (!isSession(decoded)) {
      return null;
    }

    const { integrationId, customerId, visitorId } = decoded;

    return { integrationId, customerId, visitorId };
  } catch {
    return null;
  }
};

export const requireWidgetSession = (
  req?: TRequestLike | null,
  integrationId?: string,
): TWidgetSession => {
  const session = readWidgetSession(req);

  if (!session || (integrationId && session.integrationId !== integrationId)) {
    throw new Error('Widget session required');
  }

  return session;
};

/** The query part that limits records to the session's own customer. */
export const widgetOwnerSelector = ({
  customerId,
  visitorId,
}: TWidgetSession) => (customerId ? { customerId } : { visitorId });

/**
 * A visitor's first message creates a customer that keeps the visitor id, so a
 * session owns a record through either id it carries.
 */
export const isOwnedBySession = (
  session: TWidgetSession,
  record?: { customerId?: string | null; visitorId?: string | null } | null,
) =>
  !!record &&
  ((!!session.customerId && record.customerId === session.customerId) ||
    (!!session.visitorId && record.visitorId === session.visitorId));

// "Not found" rather than "forbidden": a guessed id must learn nothing.
export const assertOwnsConversation = (
  session: TWidgetSession,
  conversation?: {
    integrationId?: string;
    customerId?: string | null;
    visitorId?: string | null;
  } | null,
) => {
  if (
    !conversation ||
    conversation.integrationId !== session.integrationId ||
    !isOwnedBySession(session, conversation)
  ) {
    throw new Error('Conversation not found');
  }
};

/**
 * The customer a visitor id created. Uses `find`, not `findOne`: core's
 * `findOne` ignores keys it does not know and would return any customer.
 */
export const findVisitorCustomer = async (
  subdomain: string,
  visitorId?: string,
): Promise<{ _id: string } | null> => {
  if (!visitorId) {
    return null;
  }

  const customers: Array<{ _id: string }> =
    (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'find',
      input: { query: { visitorId, status: { $ne: 'deleted' } } },
      defaultValue: [],
    })) || [];

  return customers.find((customer) => customer?._id) ?? null;
};

/**
 * The customer a session speaks for. A visitor's first message creates one that
 * keeps the visitor id, which our own token issued, so it is theirs.
 */
export const resolveSessionCustomerId = async (
  subdomain: string,
  session: TWidgetSession,
): Promise<string | undefined> => {
  if (session.customerId) {
    return session.customerId;
  }

  return (await findVisitorCustomer(subdomain, session.visitorId))?._id;
};

/**
 * Tickets of the session's customer: those keeping it in their own
 * `customerId` (given `models`). A bare visitor owns none.
 */
export const getOwnedTicketIds = async (
  subdomain: string,
  session: TWidgetSession,
  models?: IModels,
): Promise<string[]> => {
  const customerId = await resolveSessionCustomerId(subdomain, session);

  if (!customerId || !models) {
    return [];
  }

  const tickets = await models.Ticket.find({ customerId }, { _id: 1 }).lean();

  return tickets.map((ticket) => String(ticket._id));
};

export const assertOwnsTicket = async (
  subdomain: string,
  session: TWidgetSession,
  ticketId?: string | null,
  models?: IModels,
) => {
  const owned = ticketId
    ? (await getOwnedTicketIds(subdomain, session, models)).includes(ticketId)
    : false;

  if (!owned) {
    throw new Error('Ticket not found');
  }
};
