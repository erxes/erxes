import { createHmac } from 'crypto';
import * as jwt from 'jsonwebtoken';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  WIDGET_SESSION_HEADER,
  assertOwnsConversation,
  assertOwnsTicket,
  findVisitorCustomer,
  getOwnedTicketIds,
  readWidgetSession,
  requireWidgetSession,
  signWidgetSession,
} from '../widgetSession';

const sendTRPCMessageMock = sendTRPCMessage as jest.Mock;

const asRequest = (token?: string) => ({
  headers: token ? { [WIDGET_SESSION_HEADER]: token } : {},
});

const customerSession = { integrationId: 'int-1', customerId: 'cust-1' };
const visitorSession = { integrationId: 'int-1', visitorId: 'vis-1' };

beforeEach(() => {
  sendTRPCMessageMock.mockReset();
});

describe('widget session token', () => {
  test('reads back what it signed', () => {
    const token = signWidgetSession(customerSession);

    expect(readWidgetSession(asRequest(token))).toEqual({
      ...customerSession,
      visitorId: undefined,
    });
  });

  test('refuses a missing, altered or foreign token', () => {
    const token = signWidgetSession(customerSession);
    const [header, , signature] = token.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ ...customerSession, customerId: 'cust-2' }),
    ).toString('base64url');

    expect(readWidgetSession(asRequest())).toBeNull();
    expect(
      readWidgetSession(asRequest(`${header}.${forgedPayload}.${signature}`)),
    ).toBeNull();

    // A staff token signed with the plain secret must never pass.
    const staffToken = jwt.sign(
      { user: { _id: 'staff' }, ...customerSession },
      process.env.JWT_TOKEN_SECRET || 'SECRET',
    );
    expect(readWidgetSession(asRequest(staffToken))).toBeNull();

    // Right secret, wrong audience.
    const otherAudience = jwt.sign(
      customerSession,
      createHmac('sha256', process.env.JWT_TOKEN_SECRET || 'SECRET')
        .update('erxes-widget')
        .digest('hex'),
      { audience: 'someone-else' },
    );
    expect(readWidgetSession(asRequest(otherAudience))).toBeNull();
  });

  test('requires the session to belong to the asked integration', () => {
    const request = asRequest(signWidgetSession(customerSession));

    expect(requireWidgetSession(request, 'int-1')).toMatchObject(
      customerSession,
    );
    expect(() => requireWidgetSession(request, 'int-2')).toThrow(
      'Widget session required',
    );
    expect(() => requireWidgetSession(asRequest())).toThrow(
      'Widget session required',
    );
  });
});

describe('conversation ownership', () => {
  test('owns its own conversations through either id', () => {
    expect(() =>
      assertOwnsConversation(customerSession, {
        integrationId: 'int-1',
        customerId: 'cust-1',
      }),
    ).not.toThrow();

    // A visitor's first message gives the conversation a customer too.
    expect(() =>
      assertOwnsConversation(visitorSession, {
        integrationId: 'int-1',
        customerId: 'created-for-visitor',
        visitorId: 'vis-1',
      }),
    ).not.toThrow();
  });

  test("refuses someone else's conversation as not found", () => {
    expect(() =>
      assertOwnsConversation(customerSession, {
        integrationId: 'int-1',
        customerId: 'cust-2',
      }),
    ).toThrow('Conversation not found');

    expect(() =>
      assertOwnsConversation(customerSession, {
        integrationId: 'int-2',
        customerId: 'cust-1',
      }),
    ).toThrow('Conversation not found');

    expect(() =>
      assertOwnsConversation(visitorSession, {
        integrationId: 'int-1',
        visitorId: 'vis-2',
      }),
    ).toThrow('Conversation not found');

    expect(() => assertOwnsConversation(visitorSession, null)).toThrow(
      'Conversation not found',
    );
  });
});

describe('visitor customer lookup', () => {
  test('never asks core without a visitor id', async () => {
    await expect(findVisitorCustomer('sub', undefined)).resolves.toBeNull();
    await expect(findVisitorCustomer('sub', '')).resolves.toBeNull();
    expect(sendTRPCMessageMock).not.toHaveBeenCalled();
  });

  test('a visitor with no customer yet resolves to none', async () => {
    sendTRPCMessageMock.mockResolvedValueOnce([]);

    await expect(getOwnedTicketIds('sub', visitorSession)).resolves.toEqual([]);
  });
});

describe('ticket ownership', () => {
  // Tickets keep their customer themselves (`customerId`).
  const ticketsByCustomer: Record<string, string[]> = {
    'cust-1': ['ticket-1'],
  };
  const Ticket = {
    find: jest.fn(({ customerId }: { customerId: string }) => ({
      lean: () =>
        Promise.resolve(
          (ticketsByCustomer[customerId] || []).map((_id) => ({ _id })),
        ),
    })),
  };
  const models = { Ticket } as unknown as Parameters<
    typeof getOwnedTicketIds
  >[2];

  test("lists only the session customer's tickets", async () => {
    await expect(
      getOwnedTicketIds('sub', customerSession, models),
    ).resolves.toEqual(['ticket-1']);
    expect(Ticket.find).toHaveBeenCalledWith(
      { customerId: 'cust-1' },
      { _id: 1 },
    );
  });

  test('a visitor owns the tickets of the customer it became', async () => {
    sendTRPCMessageMock.mockResolvedValueOnce([{ _id: 'cust-1' }]);

    await expect(
      getOwnedTicketIds('sub', visitorSession, models),
    ).resolves.toEqual(['ticket-1']);
    expect(sendTRPCMessageMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: 'find',
        input: {
          query: { visitorId: 'vis-1', status: { $ne: 'deleted' } },
        },
      }),
    );
  });

  test("refuses someone else's ticket", async () => {
    await expect(
      assertOwnsTicket('sub', customerSession, 'ticket-2', models),
    ).rejects.toThrow('Ticket not found');
    await expect(
      assertOwnsTicket('sub', customerSession, 'ticket-1', models),
    ).resolves.toBeUndefined();
  });
});
