import type { IModels } from '../connectionResolvers';
import { boardNumberGenerator, generateLastNum } from '../modules/sales/utils';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp:
    jest.requireActual<typeof import('lodash')>('lodash').escapeRegExp,
}));
jest.mock('../modules/sales/graphql/resolvers/queries/deals', () => ({}));

type PipelineNumber = { lastNum: string; type: string };

const createModels = (pipelines: PipelineNumber[], numbers: string[] = []) => {
  const models = {
    Pipelines: {
      findOne: jest.fn(async (query: { lastNum: RegExp; type: string }) =>
        pipelines.find(
          (pipeline) =>
            pipeline.type === query.type &&
            query.lastNum.test(pipeline.lastNum),
        ),
      ),
    },
    Deals: {
      findOne: jest.fn((query: { number: RegExp }) => ({
        sort: jest.fn(async () => {
          const number = numbers.find((value) => query.number.test(value));
          return number ? { number } : null;
        }),
      })),
    },
  };
  return models as unknown as IModels;
};

describe.each([
  ['INV.', 'INVx'],
  ['INV(', 'INV'],
  ['INV[1]', 'INV1'],
  ['INV(', 'XINV('],
  ['2026-', 'X2026-'],
  ['', 'INV'],
])('literal number prefix %s', (prefix, otherPrefix) => {
  const lastNum = `${prefix}0007`;
  const config = {
    name: 'Pipeline',
    boardId: 'board',
    type: 'deal',
    numberConfig: prefix,
    numberSize: '4',
  };
  const pipelines = [
    { lastNum: `${otherPrefix}0099`, type: 'deal' },
    { lastNum: `${prefix}0088`, type: 'ticket' },
    { lastNum, type: 'deal' },
  ];

  it('increments the matching pipeline number', async () => {
    await expect(
      boardNumberGenerator(createModels(pipelines), prefix, '4', false, 'deal'),
    ).resolves.toBe(`${prefix}0008`);
  });

  it('restores the last number from a matching pipeline', async () => {
    await expect(
      generateLastNum(createModels(pipelines), config),
    ).resolves.toBe(lastNum);
  });

  it('falls back to a deal number with the literal prefix and numeric suffix', async () => {
    const models = createModels(
      [],
      [`${otherPrefix}0099`, `${prefix}0010-extra`, lastNum],
    );
    await expect(generateLastNum(models, config)).resolves.toBe(lastNum);
  });
});

it('preserves date placeholders, padding, and reset behavior', async () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  try {
    const models = createModels([{ lastNum: '2026/10/15-0009', type: 'deal' }]);
    const config = '{year}/{month}/{day}-';
    await expect(
      boardNumberGenerator(models, config, '4', false, 'deal'),
    ).resolves.toBe('2026/10/15-0010');
    await expect(
      boardNumberGenerator(models, config, '4', true, 'deal'),
    ).resolves.toBe('2026/10/15-0000');
  } finally {
    jest.useRealTimers();
  }
});

it('initializes an unused prefix without changing its punctuation', async () => {
  await expect(
    generateLastNum(createModels([]), {
      name: 'Pipeline',
      boardId: 'board',
      type: 'deal',
      numberConfig: 'INV(',
      numberSize: '4',
    }),
  ).resolves.toBe('INV(0000');
});
