jest.mock('erxes-api-shared/core-modules', () => ({
  canGroup: jest.fn(async () => false),
  getStructureUserContext: jest.fn(),
}));

import {
  IStructureUserContext,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { getStructureUserContext } from 'erxes-api-shared/core-modules';
import sift from 'sift';
import { IModels } from '~/connectionResolvers';
import { assertMailSenderAccess } from '@/integrations/mail/utils/senderAccess';
import { readMailSenders } from '@/integrations/mail/utils/senders';

type TDoc = Record<string, unknown> & { _id: string };

const memoryCollection = (docs: TDoc[]) => {
  const matching = (query: object = {}) => docs.filter(sift(query));
  const cursor = (rows: TDoc[]) => ({
    select: () => cursor(rows),
    sort: () => cursor(rows),
    lean: async () => rows,
    distinct: async (field: string) => [
      ...new Set(rows.map((row) => row[field])),
    ],
  });

  return {
    find: (query?: object) => cursor(matching(query)),
    exists: async (query?: object) => {
      const [doc] = matching(query);

      return doc ? { _id: doc._id } : null;
    },
  };
};

const CONTEXTS: Record<string, IStructureUserContext> = {
  member: {
    primaryEntityId: 'salesEast',
    entityIds: ['salesEast'],
    principalEntityIds: ['root', 'sales', 'salesEast'],
    boundaryEntityIds: ['salesEast'],
    boundaryUserIds: ['member'],
  },
  outsider: {
    primaryEntityId: 'support',
    entityIds: ['support'],
    principalEntityIds: ['root', 'support'],
    boundaryEntityIds: ['support'],
    boundaryUserIds: ['outsider'],
  },
};

const integrations: TDoc[] = [
  {
    _id: 'salesInbox',
    name: 'Sales',
    visibility: 'private',
    sharedEntityIds: ['sales'],
  },
  {
    _id: 'supportInbox',
    name: 'Support',
    visibility: 'private',
    sharedEntityIds: ['support'],
  },
  { _id: 'publicInbox', name: 'Public', visibility: 'public' },
  { _id: 'authorInbox', name: 'Author', visibility: 'private' },
].map((integration) => ({
  kind: 'mail',
  channelId: 'channel',
  createdUserId: 'author',
  ...integration,
}));

const models = {
  Channels: memoryCollection([{ _id: 'channel', scope: 'team' }]),
  ChannelMembers: memoryCollection(
    ['member', 'outsider', 'author'].map((memberId) => ({
      _id: memberId,
      channelId: 'channel',
      memberId,
    })),
  ),
  Integrations: memoryCollection(integrations),
  MailIntegrations: memoryCollection(
    integrations.map(({ _id }) => ({
      _id: `mail-${_id}`,
      inboxId: _id,
      address: `${_id}@example.com`,
      disabledAt: null,
    })),
  ),
} as unknown as IModels;

const asUser = (_id: string, isOwner = false) =>
  ({ _id, isOwner }) as IUserDocument;

const canSend = (user: IUserDocument, integrationId: string) =>
  assertMailSenderAccess({
    models,
    subdomain: 'tenant',
    user,
    integrationId,
  }).then(
    () => true,
    () => false,
  );

const senderNames = async (user: IUserDocument) =>
  (await readMailSenders({ models, subdomain: 'tenant', user }))
    .map(({ name }) => name)
    .sort();

beforeEach(() => {
  (getStructureUserContext as jest.Mock).mockImplementation(
    async (_subdomain: string, userId: string) =>
      CONTEXTS[userId] || {
        entityIds: [],
        principalEntityIds: [],
        boundaryEntityIds: [],
        boundaryUserIds: [],
      },
  );
});

describe('mail sender access through structure sharing', () => {
  test('a member below a shared node may send from the private inbox', async () => {
    await expect(canSend(asUser('member'), 'salesInbox')).resolves.toBe(true);
  });

  test('an outsider may not send from it', async () => {
    await expect(canSend(asUser('outsider'), 'salesInbox')).resolves.toBe(
      false,
    );
  });

  test('the creator and the owner may send from any private inbox', async () => {
    await expect(canSend(asUser('author'), 'salesInbox')).resolves.toBe(true);
    await expect(canSend(asUser('owner', true), 'supportInbox')).resolves.toBe(
      true,
    );
  });

  test('each user lists only the senders shared with them', async () => {
    await expect(senderNames(asUser('member'))).resolves.toEqual([
      'Public',
      'Sales',
    ]);
    await expect(senderNames(asUser('outsider'))).resolves.toEqual([
      'Public',
      'Support',
    ]);
    await expect(senderNames(asUser('owner', true))).resolves.toEqual([
      'Author',
      'Public',
      'Sales',
      'Support',
    ]);
  });
});
