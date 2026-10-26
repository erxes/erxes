/**
 * `deal.add` / `deal.edit` / `deal.move` — the agent-facing deal write tools.
 *
 * The guarantees under test:
 *
 * - writes run as the acting user, resolved through core's users.findOne;
 *   an empty `ctx.userId` or an unknown user fails UNAUTHORIZED;
 * - missing stage/deal targets fail NOT_FOUND and empty edits fail
 *   BAD_REQUEST before the deal helpers run;
 * - ISO date strings are converted to `Date` and only provided fields reach
 *   the GraphQL mutation helpers;
 * - only the new procedures carry agent meta; the system-user `create` /
 *   `updateOne` procedures stay invisible.
 */

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  addDeal,
  changeDeal,
  editDeal,
} from '~/modules/sales/graphql/resolvers/mutations/utils';
import { dealTrpcRouter, SalesTRPCContext } from '~/modules/sales/trpc/deal';

jest.mock('~/modules/sales/graphql/resolvers/mutations/utils', () => ({
  addDeal: jest.fn(),
  editDeal: jest.fn(),
  changeDeal: jest.fn(),
}));

// Mock the submodule, not the barrel: mocking 'erxes-api-shared/utils'
// itself hits a circular self-import while the barrel is still loading.
jest.mock('erxes-api-shared/utils/trpc', () => ({
  ...jest.requireActual('erxes-api-shared/utils/trpc'),
  sendTRPCMessage: jest.fn(),
}));

const mockedAddDeal = jest.mocked(addDeal);
const mockedEditDeal = jest.mocked(editDeal);
const mockedChangeDeal = jest.mocked(changeDeal);
const mockedSendTRPCMessage = jest.mocked(sendTRPCMessage);

const actingUser = { _id: 'user1', email: 'agent@erxes.io' };

const leanable = <T>(value: T) => ({
  lean: jest.fn(async () => value),
});

const buildCaller = ({
  userId = 'user1',
  foundUser = actingUser,
  stage = { _id: 'stage1', pipelineId: 'pipe1' } as unknown,
  deal = { _id: 'deal1', stageId: 'stage1' } as unknown,
}: {
  userId?: string;
  foundUser?: unknown;
  stage?: unknown;
  deal?: unknown;
} = {}) => {
  const models = {
    Stages: { findOne: jest.fn(() => leanable(stage)) },
    Deals: { findOne: jest.fn(() => leanable(deal)) },
  };

  mockedSendTRPCMessage.mockResolvedValue(foundUser);

  const caller = dealTrpcRouter.createCaller({
    subdomain: 'os',
    userId,
    processId: 'proc1',
    models,
  } as unknown as SalesTRPCContext);

  return { caller, models };
};

const agentMetaOf = (path: string) =>
  (
    dealTrpcRouter._def.procedures[path] as {
      _def: { meta?: { agent?: { permission?: unknown } } };
    }
  )._def.meta?.agent;

describe('deal.add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAddDeal.mockImplementation(async ({ doc }) => ({
      _id: 'deal1',
      ...doc,
    }));
  });

  it('creates a deal through addDeal with only the provided fields and Date values', async () => {
    const { caller, models } = buildCaller();

    const result = await caller.deal.add({
      name: 'New deal',
      stageId: 'stage1',
      closeDate: '2026-11-15',
      customerId: 'c1',
    });

    expect(mockedSendTRPCMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'os',
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: { query: { _id: 'user1', isActive: { $ne: false } } },
        defaultValue: null,
      }),
    );
    expect(models.Stages.findOne).toHaveBeenCalledWith({ _id: 'stage1' });
    expect(mockedAddDeal).toHaveBeenCalledWith({
      models,
      subdomain: 'os',
      user: actingUser,
      doc: {
        name: 'New deal',
        stageId: 'stage1',
        closeDate: new Date('2026-11-15'),
        customerId: 'c1',
      },
    });
    expect(result).toMatchObject({ _id: 'deal1', name: 'New deal' });
  });

  it('rejects NOT_FOUND when the stage does not exist', async () => {
    const { caller } = buildCaller({ stage: null });

    await expect(
      caller.deal.add({ name: 'New deal', stageId: 'missing' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mockedAddDeal).not.toHaveBeenCalled();
  });

  it('rejects UNAUTHORIZED without an acting user', async () => {
    const { caller } = buildCaller({ userId: '' });

    await expect(
      caller.deal.add({ name: 'New deal', stageId: 'stage1' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(mockedSendTRPCMessage).not.toHaveBeenCalled();
    expect(mockedAddDeal).not.toHaveBeenCalled();
  });

  it('rejects UNAUTHORIZED when core does not resolve the user', async () => {
    const { caller } = buildCaller({ foundUser: null });

    await expect(
      caller.deal.add({ name: 'New deal', stageId: 'stage1' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(mockedAddDeal).not.toHaveBeenCalled();
  });
});

describe('deal.edit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedEditDeal.mockImplementation(async ({ _id, doc }) => ({ _id, doc }));
  });

  it('rejects an edit with no fields besides _id', async () => {
    const { caller, models } = buildCaller();

    await expect(caller.deal.edit({ _id: 'deal1' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    expect(models.Deals.findOne).not.toHaveBeenCalled();
    expect(mockedEditDeal).not.toHaveBeenCalled();
  });

  it('rejects NOT_FOUND when the deal does not exist', async () => {
    const { caller } = buildCaller({ deal: null });

    await expect(
      caller.deal.edit({ _id: 'missing', name: 'x' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mockedEditDeal).not.toHaveBeenCalled();
  });

  it('passes only the provided fields, the processId, and the acting user to editDeal', async () => {
    const { caller, models } = buildCaller();

    await caller.deal.edit({
      _id: 'deal1',
      name: 'Renamed',
      startDate: '2026-01-10',
      assignedUserIds: ['u1', 'u2'],
    });

    expect(mockedEditDeal).toHaveBeenCalledWith({
      models,
      subdomain: 'os',
      _id: 'deal1',
      processId: 'proc1',
      doc: {
        name: 'Renamed',
        startDate: new Date('2026-01-10'),
        assignedUserIds: ['u1', 'u2'],
      },
      user: actingUser,
    });
  });
});

describe('deal.move', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedChangeDeal.mockResolvedValue({
      _id: 'deal1',
      stageId: 'stage2',
    } as never);
  });

  it('rejects NOT_FOUND for a missing deal or destination stage', async () => {
    const { caller: noDeal } = buildCaller({ deal: null });
    await expect(
      noDeal.deal.move({ _id: 'missing', stageId: 'stage2' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });

    const { caller: noStage } = buildCaller({ stage: null });
    await expect(
      noStage.deal.move({ _id: 'deal1', stageId: 'missing' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mockedChangeDeal).not.toHaveBeenCalled();
  });

  it('moves the deal through changeDeal with the acting user and process id', async () => {
    const { caller, models } = buildCaller();

    const result = await caller.deal.move({ _id: 'deal1', stageId: 'stage2' });

    expect(models.Stages.findOne).toHaveBeenCalledWith({ _id: 'stage2' });
    expect(mockedChangeDeal).toHaveBeenCalledWith('os', models, 'user1', {
      itemId: 'deal1',
      destinationStageId: 'stage2',
      sourceStageId: 'stage1',
      processId: 'proc1',
    });
    expect(result).toMatchObject({ _id: 'deal1', stageId: 'stage2' });
  });
});

describe('internal tRPC procedures', () => {
  it('does not expose agent metadata', () => {
    expect(agentMetaOf('deal.add')).toBeUndefined();
    expect(agentMetaOf('deal.edit')).toBeUndefined();
    expect(agentMetaOf('deal.move')).toBeUndefined();
  });
});
