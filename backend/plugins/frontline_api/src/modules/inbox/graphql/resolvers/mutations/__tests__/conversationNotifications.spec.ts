import type { IConversationDocument } from '@/inbox/@types/conversations';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversationNotifications';
import { sendNotification } from 'erxes-api-shared/core-modules';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  sendNotification: jest.fn(),
}));
jest.mock('~/modules/inbox/utils', () => ({ debugError: jest.fn() }));

const sendTRPCMessageMock = sendTRPCMessage as jest.MockedFunction<
  typeof sendTRPCMessage
>;
const sendNotificationMock = sendNotification as jest.MockedFunction<
  typeof sendNotification
>;

const user = { _id: 'agent-1' } as IUserDocument;
const conversation = {
  _id: 'conversation-1',
  integrationId: 'integration-1',
  customerId: 'customer-1',
  assignedUserId: 'agent-2',
} as IConversationDocument;

const calledModules = () =>
  sendTRPCMessageMock.mock.calls.map(([options]) => options.module);

describe('sendNotifications', () => {
  beforeEach(() => {
    sendNotificationMock.mockReset();
    sendTRPCMessageMock.mockReset();
    sendTRPCMessageMock.mockImplementation(async ({ module }) =>
      module === 'cpUsers'
        ? { _id: 'cp-user-1', clientPortalId: 'portal-1' }
        : null,
    );
  });

  it('pushes a customer-visible reply to the client portal and agents', async () => {
    await sendNotifications('os', {
      user,
      conversations: [conversation],
      type: 'conversationAddMessage',
      mobile: true,
      messageContent: '<p>Hello</p>',
    });

    expect(calledModules()).toEqual(
      expect.arrayContaining(['cpUsers', 'cpNotifications']),
    );
    expect(sendNotificationMock).toHaveBeenCalledWith(
      'os',
      expect.objectContaining({
        event: 'frontline:conversations:conversationAddMessage',
        inApp: false,
        userIds: ['agent-2'],
        pushData: expect.objectContaining({
          conversationId: 'conversation-1',
          notificationType: 'chat_message',
        }),
      }),
    );
  });

  it('never pushes an internal note to the customer', async () => {
    await sendNotifications('os', {
      user,
      conversations: [conversation],
      type: 'conversationAddMessage',
      mobile: true,
      messageContent: '<p>Agent-only note</p>',
      internal: true,
    });

    expect(calledModules()).not.toContain('cpUsers');
    expect(calledModules()).not.toContain('cpNotifications');
    expect(sendNotificationMock).toHaveBeenCalledWith(
      'os',
      expect.objectContaining({ message: 'Agent-only note' }),
    );
  });
});
