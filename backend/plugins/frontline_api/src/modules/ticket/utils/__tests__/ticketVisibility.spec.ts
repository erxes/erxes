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
    primaryEntityId: 'store',
    entityIds: ['store'],
    principalEntityIds: ['root', 'district', 'store'],
    boundaryEntityIds: ['store'],
    boundaryUserIds: ['member'],
  },
  outsider: {
    primaryEntityId: 'otherDistrict',
    entityIds: ['otherDistrict'],
    principalEntityIds: ['root', 'otherDistrict'],
    boundaryEntityIds: ['otherDistrict'],
    boundaryUserIds: ['outsider'],
  },
  lead: {
    primaryEntityId: 'district',
    entityIds: ['district'],
    principalEntityIds: ['root', 'district'],
    boundaryEntityIds: ['district', 'store'],
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
    sharedEntityIds: ['district'],
  },
];

const tickets: TDoc[] = [
  { _id: 'atStore', pipelineId: 'checked', entityIds: ['store'] },
  { _id: 'atDistrict', pipelineId: 'checked', entityIds: ['district'] },
  { _id: 'atRoot', pipelineId: 'checked', entityIds: ['root'] },
  {
    _id: 'atOtherDistrict',
    pipelineId: 'checked',
    entityIds: ['otherDistrict'],
  },
  { _id: 'unassigned', pipelineId: 'checked', entityIds: [] },
  {
    _id: 'createdByMember',
    pipelineId: 'checked',
    entityIds: ['otherDistrict'],
    createdBy: 'member',
  },
  { _id: 'openPipeline', pipelineId: 'open', entityIds: ['otherDistrict'] },
  {
    _id: 'privatePipeline',
    pipelineId: 'private',
    entityIds: ['otherDistrict'],
  },
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
  test('a store member sees tickets at their store, never at the district or root above it', async () => {
    await expect(
      visibleTickets(asUser('member'), { pipelineId: 'checked' }),
    ).resolves.toEqual(['atStore', 'createdByMember']);
  });

  test('an outsider sees only tickets at their own node', async () => {
    await expect(
      visibleTickets(asUser('outsider'), { pipelineId: 'checked' }),
    ).resolves.toEqual(['atOtherDistrict', 'createdByMember']);
  });

  test('a seat with below coverage at the district sees the district and its stores, not the root', async () => {
    await expect(
      visibleTickets(asUser('lead'), { pipelineId: 'checked' }),
    ).resolves.toEqual(['atDistrict', 'atStore']);
  });

  test('the owner sees every ticket', async () => {
    await expect(
      visibleTickets(asUser('owner', true), { pipelineId: 'checked' }),
    ).resolves.toEqual([
      'atDistrict',
      'atOtherDistrict',
      'atRoot',
      'atStore',
      'createdByMember',
      'unassigned',
    ]);
  });

  test('across a channel only checked pipelines are narrowed', async () => {
    await expect(
      visibleTickets(asUser('member'), { channelId: 'channel' }),
    ).resolves.toEqual([
      'atStore',
      'createdByMember',
      'openPipeline',
      'privatePipeline',
    ]);
  });

  test('a private pipeline shared with an ancestor node is open to members below it only', async () => {
    await expect(
      visibleTickets(asUser('member'), { pipelineId: 'private' }),
    ).resolves.toEqual(['privatePipeline']);
    await expect(
      visibleTickets(asUser('outsider'), { pipelineId: 'private' }),
    ).rejects.toThrow('Access denied');
    await expect(
      visibleTickets(asUser('outsider'), { channelId: 'channel' }),
    ).resolves.toEqual(['atOtherDistrict', 'createdByMember', 'openPipeline']);
  });

  test('the structure filter narrows to the chosen nodes', async () => {
    await expect(
      visibleTickets(asUser('owner', true), {
        pipelineId: 'checked',
        entityIds: ['district', 'otherDistrict'],
      }),
    ).resolves.toEqual(['atDistrict', 'atOtherDistrict', 'createdByMember']);
  });
});
