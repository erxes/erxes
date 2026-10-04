import { sendTRPCMessage } from '../../utils/trpc';
import {
  BROADCAST_TARGET_TYPE,
  BROADCAST_TRIGGER_TYPE,
  getTriggerTargetType,
} from './constants';
import { setProperty } from './utils';

jest.mock('../../utils/trpc', () => ({ sendTRPCMessage: jest.fn() }));

const mockedSendTRPCMessage = jest.mocked(sendTRPCMessage);

type TSetPropertyArgs = Parameters<typeof setProperty>[0];

const execution = {} as TSetPropertyArgs['execution'];

const run = (overrides: Partial<TSetPropertyArgs>) =>
  setProperty({
    models: {},
    subdomain: 'test',
    module: 'core:contacts.customers',
    rules: [{ field: 'propertiesData.plan', operator: 'set', value: 'pro' }],
    execution,
    ...overrides,
  } as TSetPropertyArgs);

describe('setProperty · outcome', () => {
  beforeEach(() => {
    mockedSendTRPCMessage.mockReset();
    // validateFieldValues echoes what it was given
    mockedSendTRPCMessage.mockImplementation(
      async ({ input }: never) => (input as { data: unknown }).data,
    );
  });

  it('marks the change updated when a record matched', async () => {
    const result = await run({
      selector: { _id: 'c1' },
      update: async () => ({ matchedCount: 1 }),
    });

    expect(result.target?.count).toBe(1);
    expect(result.changes?.map(({ status }) => status)).toEqual(['updated']);
  });

  it('marks the change skipped when nothing matched', async () => {
    const result = await run({
      selector: { _id: { $in: [] } },
      update: async () => ({ matchedCount: 0 }),
    });

    expect(result.target?.count).toBe(0);
    expect(result.changes?.map(({ status }) => status)).toEqual(['skipped']);
  });

  it('marks every rule skipped when a current-value rule finds no record', async () => {
    const update = jest.fn();

    const result = await run({
      rules: [{ field: 'propertiesData.score', operator: 'add', value: '5' }],
      selector: { _id: 'missing' },
      fetchItems: async () => [],
      update,
    });

    expect(update).not.toHaveBeenCalled();
    expect(result.target?.count).toBe(0);
    expect(result.changes?.map(({ status }) => status)).toEqual(['skipped']);
  });

  it('skips only the item a per-record update did not reach', async () => {
    const update = jest
      .fn()
      .mockResolvedValueOnce({ matchedCount: 1 })
      .mockResolvedValueOnce({ matchedCount: 0 });

    const result = await run({
      rules: [{ field: 'propertiesData.score', operator: 'add', value: '5' }],
      selector: { _id: { $in: ['a', 'b'] } },
      fetchItems: async () => [
        { _id: 'a', propertiesData: { score: 1 } },
        { _id: 'b', propertiesData: { score: 2 } },
      ],
      update,
    });

    expect(result.target?.count).toBe(1);
    expect(result.changes?.map(({ status }) => status)).toEqual([
      'updated',
      'skipped',
    ]);
  });
});

describe('getTriggerTargetType', () => {
  it('runs a broadcast against the customer it hands each run', () => {
    expect(getTriggerTargetType(BROADCAST_TRIGGER_TYPE)).toBe(
      BROADCAST_TARGET_TYPE,
    );
  });

  it('keeps any other trigger as its own target type', () => {
    expect(getTriggerTargetType('sales:sales.deals')).toBe('sales:sales.deals');
  });
});
