jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  buildPropertyFilter: () => [],
  getStructureUserContext: jest.fn(),
}));

import { IStructureUserContext } from 'erxes-api-shared/core-types';
import { getStructureUserContext } from 'erxes-api-shared/core-modules';
import sift from 'sift';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '@/ticket/utils/generateFilter';
import { IUserDocument } from 'erxes-api-shared/core-types';

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
    findOne: async (query?: object) => matching(query)[0] ?? null,
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
  lead: {
    primaryEntityId: 'sales',
    entityIds: ['sales'],
    principalEntityIds: ['root', 'sales'],
    boundaryEntityIds: ['sales', 'salesEast'],
    boundaryUserIds: ['lead', 'member'],
  },
};

const pipelines: TDoc[] = [
  { _id: 'checked', channelId: 'channel', isCheckEntity: true },
  { _id: 'open', channelId: 'channel' },
  {
    _id: 'private',
    channelId: 'channel',
    visibility: 'private',
    sharedEntityIds: ['sales'],
  },
];

const tickets: TDoc[] = [
  { _id: 'atSalesEast', pipelineId: 'checked', entityIds: ['salesEast'] },
  { _id: 'atSales', pipelineId: 'checked', entityIds: ['sales'] },
  { _id: 'atSupport', pipelineId: 'checked', entityIds: ['support'] },
  { _id: 'unassigned', pipelineId: 'checked', entityIds: [] },
  {
    _id: 'createdByMember',
    pipelineId: 'checked',
    entityIds: ['support'],
    createdBy: 'member',
  },
  { _id: 'openPipeline', pipelineId: 'open', entityIds: ['support'] },
  { _id: 'privatePipeline', pipelineId: 'private', entityIds: ['support'] },
].map((ticket) => ({ channelId: 'channel', createdBy: 'author', ...ticket }));

const models = {
  Pipeline: memoryCollection(pipelines),
  Status: memoryCollection([]),
} as unknown as IModels;

const asUser = (_id: string, isOwner = false) =>
  ({ _id, isOwner }) as IUserDocument;

const visibleTickets = async (
  user: IUserDocument,
  filter: Record<string, unknown> = {},
) => {
  const query = await generateFilter(filter, user, models, 'tenant');

  return tickets
    .filter(sift(query))
    .map(({ _id }) => _id)
    .sort();
};

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

describe('ticket visibility on a structure-checked pipeline', () => {
  test('a member sees tickets at their node and at an ancestor node', async () => {
    await expect(
      visibleTickets(asUser('member'), { pipelineId: 'checked' }),
    ).resolves.toEqual(['atSales', 'atSalesEast', 'createdByMember']);
  });

  test('an outsider sees only tickets of their own branch of the tree', async () => {
    await expect(
      visibleTickets(asUser('outsider'), { pipelineId: 'checked' }),
    ).resolves.toEqual(['atSupport', 'createdByMember']);
  });

  test('a seat covering the nodes below also shows their tickets', async () => {
    await expect(
      visibleTickets(asUser('lead'), { pipelineId: 'checked' }),
    ).resolves.toEqual(['atSales', 'atSalesEast']);
  });

  test('the owner sees every ticket', async () => {
    await expect(
      visibleTickets(asUser('owner', true), { pipelineId: 'checked' }),
    ).resolves.toEqual([
      'atSales',
      'atSalesEast',
      'atSupport',
      'createdByMember',
      'unassigned',
    ]);
  });

  test('across a channel only checked pipelines are narrowed', async () => {
    await expect(
      visibleTickets(asUser('member'), { channelId: 'channel' }),
    ).resolves.toEqual([
      'atSales',
      'atSalesEast',
      'createdByMember',
      'openPipeline',
      'privatePipeline',
    ]);
  });

  test('a private pipeline shared with an ancestor node is open to its members only', async () => {
    await expect(
      visibleTickets(asUser('member'), { pipelineId: 'private' }),
    ).resolves.toEqual(['privatePipeline']);
    await expect(
      visibleTickets(asUser('outsider'), { pipelineId: 'private' }),
    ).rejects.toThrow('Access denied');
    await expect(
      visibleTickets(asUser('outsider'), { channelId: 'channel' }),
    ).resolves.toEqual(['atSupport', 'createdByMember', 'openPipeline']);
  });

  test('the structure filter narrows to the chosen nodes', async () => {
    await expect(
      visibleTickets(asUser('owner', true), {
        pipelineId: 'checked',
        entityIds: ['sales', 'support'],
      }),
    ).resolves.toEqual(['atSales', 'atSupport', 'createdByMember']);
  });
});
