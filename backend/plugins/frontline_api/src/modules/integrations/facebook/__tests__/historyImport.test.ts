import type { IModels } from '~/connectionResolvers';
import {
  enqueueMessengerHistoryImport,
  importMessengerHistory,
} from '@/integrations/facebook/services/historyImport';
import { getOrCreateCustomer } from '@/integrations/facebook/controller/store';
import { upsertFacebookConversation } from '@/integrations/facebook/services/conversationSync';
import { sendWorkerQueue } from 'erxes-api-shared/utils';

jest.mock('@/integrations/facebook/controller/store', () => ({
  getOrCreateCustomer: jest.fn(),
}));
jest.mock('@/integrations/facebook/services/conversationSync', () => ({
  upsertFacebookConversation: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  sendWorkerQueue: jest.fn(),
}));

const PAGE_ID = 'page-1';
const PSID = 'psid-1';
const OLD = '2024-01-01T10:00:00+0000';

const graphResponses = new Map<string, unknown>();

const graphUrl = (path: string) => `https://graph.facebook.com/v25.0/${path}`;

const mockFetch = jest.fn(async (url: string) => {
  const key = [...graphResponses.keys()].find((prefix) =>
    url.startsWith(prefix),
  );

  return {
    ok: Boolean(key),
    status: key ? 200 : 404,
    json: async () =>
      key ? graphResponses.get(key) : { error: { message: 'not found' } },
  };
});

const buildModels = ({
  existingMids = [] as string[],
  erxesApiId,
  historyImport,
}: {
  existingMids?: string[];
  erxesApiId?: string;
  historyImport?: Record<string, unknown>;
}) => {
  const integration = {
    _id: 'fb-integration',
    erxesApiId: 'inbox-integration',
    kind: 'facebook-messenger',
    facebookPageIds: [PAGE_ID],
    facebookPageTokensMap: { [PAGE_ID]: 'token' },
    historyImport,
  };
  const integrationUpdate = jest.fn().mockResolvedValue({});
  const conversationCreate = jest
    .fn()
    .mockResolvedValue({ _id: 'inbox-conversation' });
  const conversationUpdate = jest.fn().mockResolvedValue({});
  const insertMany = jest.fn().mockResolvedValue([]);
  const fbConversation = {
    _id: 'fb-conversation',
    erxesApiId,
    save: jest.fn().mockResolvedValue(undefined),
  };

  (upsertFacebookConversation as jest.Mock).mockResolvedValue(fbConversation);
  (getOrCreateCustomer as jest.Mock).mockResolvedValue({
    erxesApiId: 'customer-1',
  });

  const models = {
    FacebookIntegrations: {
      findOne: jest.fn(() => ({
        ...integration,
        lean: async () => integration,
      })),
      updateOne: integrationUpdate,
    },
    FacebookConversationMessages: {
      find: jest.fn(() => ({
        lean: async () => existingMids.map((mid) => ({ mid })),
      })),
      insertMany,
    },
    Conversations: {
      createConversation: conversationCreate,
      updateOne: conversationUpdate,
    },
  } as unknown as IModels;

  return {
    models,
    integrationUpdate,
    conversationCreate,
    conversationUpdate,
    insertMany,
    fbConversation,
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  graphResponses.clear();
  global.fetch = mockFetch as unknown as typeof fetch;

  graphResponses.set(graphUrl(`${PAGE_ID}/conversations`), {
    data: [
      {
        id: 'conv-1',
        updated_time: OLD,
        participants: {
          data: [
            { id: PSID, name: 'Customer' },
            { id: PAGE_ID, name: 'Page' },
          ],
        },
      },
    ],
    paging: { cursors: { after: 'end' } },
  });
  graphResponses.set(graphUrl('conv-1/messages'), {
    data: [
      { id: 'm_3', message: 'thanks', created_time: OLD, from: { id: PSID } },
      {
        id: 'm_2',
        message: 'hello from page',
        created_time: '2024-01-01T09:00:00+0000',
        from: { id: PAGE_ID },
      },
      {
        id: 'm_1',
        created_time: '2024-01-01T08:00:00+0000',
        from: { id: PSID },
        attachments: {
          data: [
            { name: 'photo.jpg', image_data: { url: 'https://cdn/p.jpg' } },
          ],
        },
      },
    ],
    paging: { cursors: { after: 'end' } },
  });
});

test('imports a page inbox thread into a closed conversation with page replies as outgoing', async () => {
  const {
    models,
    conversationCreate,
    conversationUpdate,
    insertMany,
    fbConversation,
    integrationUpdate,
  } = buildModels({});

  await importMessengerHistory({
    models,
    subdomain: 'tenant',
    integrationId: 'inbox-integration',
  });

  expect(getOrCreateCustomer).toHaveBeenCalledWith(
    models,
    'tenant',
    PAGE_ID,
    PSID,
    'facebook-messenger',
  );
  expect(conversationCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      customerId: 'customer-1',
      integrationId: 'inbox-integration',
      content: 'thanks',
      status: 'closed',
      createdAt: new Date('2024-01-01T08:00:00+0000'),
      isCustomerRespondedLast: true,
    }),
  );
  expect(conversationUpdate).toHaveBeenCalledWith(
    { _id: 'inbox-conversation' },
    {
      $set: expect.objectContaining({
        messageCount: 3,
        updatedAt: new Date(OLD),
        closedAt: new Date(OLD),
      }),
    },
  );
  expect(fbConversation.erxesApiId).toBe('inbox-conversation');
  expect(fbConversation.save).toHaveBeenCalled();

  const docs = insertMany.mock.calls[0][0];
  expect(docs.map((doc: { mid: string }) => doc.mid)).toEqual([
    'm_3',
    'm_2',
    'm_1',
  ]);
  expect(docs[0]).toMatchObject({
    customerId: 'customer-1',
    content: 'thanks',
  });
  expect(docs[1]).not.toHaveProperty('customerId');
  expect(docs[2].attachments).toEqual([
    { type: 'image', url: 'https://cdn/p.jpg', name: 'photo.jpg' },
  ]);

  const lastUpdate = integrationUpdate.mock.calls.at(-1)[1].$set;
  expect(lastUpdate).toMatchObject({
    'historyImport.status': 'completed',
    'historyImport.conversations': 1,
    'historyImport.messages': 3,
    'historyImport.skippedConversations': 0,
  });
});

test('adds only the messages the inbox does not hold yet to an existing conversation', async () => {
  const { models, conversationCreate, conversationUpdate, insertMany } =
    buildModels({ existingMids: ['m_3'], erxesApiId: 'inbox-conversation' });

  await importMessengerHistory({
    models,
    subdomain: 'tenant',
    integrationId: 'inbox-integration',
  });

  expect(conversationCreate).not.toHaveBeenCalled();
  expect(conversationUpdate).toHaveBeenCalledWith(
    { _id: 'inbox-conversation' },
    { $inc: { messageCount: 2 } },
  );
  expect(insertMany.mock.calls[0][0]).toHaveLength(2);
});

test('records a failed run when the Graph API refuses the page', async () => {
  graphResponses.delete(graphUrl(`${PAGE_ID}/conversations`));
  const { models, integrationUpdate } = buildModels({});

  await expect(
    importMessengerHistory({
      models,
      subdomain: 'tenant',
      integrationId: 'inbox-integration',
    }),
  ).rejects.toThrow('not found');

  expect(integrationUpdate.mock.calls.at(-1)[1].$set).toMatchObject({
    'historyImport.status': 'failed',
    'historyImport.error': 'not found',
  });
});

test('queues one run at a time', async () => {
  const add = jest.fn().mockResolvedValue({});
  (sendWorkerQueue as jest.Mock).mockReturnValue({ add });

  const running = buildModels({
    historyImport: { status: 'running', startedAt: new Date() },
  });

  await expect(
    enqueueMessengerHistoryImport(
      running.models,
      'tenant',
      'inbox-integration',
    ),
  ).rejects.toThrow('already running');
  expect(add).not.toHaveBeenCalled();

  const idle = buildModels({ historyImport: { status: 'completed' } });

  await enqueueMessengerHistoryImport(
    idle.models,
    'tenant',
    'inbox-integration',
  );

  expect(add).toHaveBeenCalledWith(
    'importMessengerHistory',
    { subdomain: 'tenant', integrationId: 'inbox-integration' },
    expect.objectContaining({ attempts: 1 }),
  );
  expect(idle.integrationUpdate.mock.calls[0][1].$set).toMatchObject({
    'historyImport.status': 'queued',
  });
});
