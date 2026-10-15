import {
  applyAutomationConditionals,
  AUTOMATION_CONDITIONALS_KEY,
  formatConditionalToken,
  isAutomationConditionMatched,
  parseConditionalToken,
  TAutomationConditional,
  validateAutomationConditional,
} from './conditionals';
import { IAutomationExecution } from './definitions/executions';
import { replaceOutputPlaceholders } from './outputResolvers';

jest.mock('./outputResolvers', () => ({
  replaceOutputPlaceholders: jest.fn(),
}));

const mockedReplace = jest.mocked(replaceOutputPlaceholders);

// Stands in for the real resolver: `{{ name }}` reads from this run's values
const runValues: Record<string, unknown> = {};

const execution = { target: {} } as unknown as IAutomationExecution;

const assigneeConditional: TAutomationConditional = {
  keys: ['assigneeId'],
  label: 'Assignee',
  rows: [
    {
      id: 'r1',
      conditions: [
        { kind: 'value', left: '{{ priority }}', operator: 'e', right: '4' },
        {
          kind: 'value',
          left: '{{ secrecy }}',
          operator: 'dne',
          right: 'нууцлалтай',
        },
      ],
      values: { assigneeId: '[[ user.bat ]]' },
    },
    {
      id: 'r2',
      conditions: [
        { kind: 'value', left: '{{ category }}', operator: 'e', right: 'road' },
      ],
      values: { assigneeId: '[[ user.dorj ]]' },
    },
  ],
  otherwise: { assigneeId: '[[ user.admin ]]' },
};

beforeEach(() => {
  for (const key of Object.keys(runValues)) {
    delete runValues[key];
  }

  mockedReplace.mockReset();
  mockedReplace.mockImplementation(async ({ values }) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        const match = String(value).match(/^\{\{\s*(\w+)\s*\}\}$/);

        return [key, match ? runValues[match[1]] ?? '' : value];
      }),
    ),
  );
});

const noSegments = async () => false;

describe('conditional tokens', () => {
  it('round-trips and tolerates spacing', () => {
    expect(formatConditionalToken('k3x')).toBe('<< cond:k3x >>');
    expect(parseConditionalToken('<< cond:k3x >>')).toBe('k3x');
    expect(parseConditionalToken('<<cond:k3x>>')).toBe('k3x');
  });

  it('ignores text that only mentions a token', () => {
    expect(parseConditionalToken('Hello << cond:k3x >>')).toBeNull();
    expect(parseConditionalToken('{{ cond.k3x }}')).toBeNull();
    expect(parseConditionalToken(42)).toBeNull();
  });
});

describe('isAutomationConditionMatched', () => {
  it('keeps split operator meanings', () => {
    expect(isAutomationConditionMatched('4', 'e', '4')).toBe(true);
    expect(isAutomationConditionMatched('4', 'dne', '4')).toBe(false);
    expect(isAutomationConditionMatched('Хог овоорсон', 'c', 'хог')).toBe(true);
    expect(isAutomationConditionMatched(10, 'numberigt', '5')).toBe(true);
    expect(isAutomationConditionMatched('', 'ins', undefined)).toBe(true);
    expect(isAutomationConditionMatched(true, 'it', undefined)).toBe(true);
    expect(isAutomationConditionMatched('x', 'unknown', 'x')).toBe(false);
  });
});

describe('validateAutomationConditional', () => {
  it('accepts a complete conditional', () => {
    expect(
      validateAutomationConditional(assigneeConditional, {
        requiredKeys: ['assigneeId'],
      }),
    ).toEqual([]);
  });

  it('names every missing piece', () => {
    const errors = validateAutomationConditional(
      {
        keys: ['assigneeId'],
        rows: [
          {
            id: 'r1',
            conditions: [
              { kind: 'value', left: '', operator: 'e', right: '' },
              { kind: 'value', left: '{{ x }}', operator: 'is' },
              { kind: 'segment', segmentId: '' },
            ],
            values: {},
          },
          { id: 'r2', conditions: [], values: { assigneeId: 'a' } },
        ],
        otherwise: {},
      },
      { requiredKeys: ['assigneeId'] },
    );

    expect(errors).toEqual([
      'Row 1, condition 1: pick a value to check',
      'Row 1, condition 1: enter a value to compare with',
      'Row 1, condition 3: pick a segment',
      'Row 1: set a value',
      'Row 2: add at least one condition',
      'Otherwise: set a value',
    ]);
  });

  it('lets an optional field fall back to nothing', () => {
    expect(
      validateAutomationConditional({ ...assigneeConditional, otherwise: {} }),
    ).toEqual([]);
  });
});

describe('applyAutomationConditionals', () => {
  const config = {
    channelId: 'c1',
    assigneeId: formatConditionalToken('k3x'),
    [AUTOMATION_CONDITIONALS_KEY]: { k3x: assigneeConditional },
  };

  it('uses the first row whose conditions all hold', async () => {
    runValues.priority = '4';
    runValues.secrecy = 'нээлттэй';
    runValues.category = 'road';

    const result = await applyAutomationConditionals({
      subdomain: 'test',
      execution,
      config,
      isInSegment: noSegments,
    });

    expect(result.config).toEqual({
      channelId: 'c1',
      assigneeId: '[[ user.bat ]]',
    });
    expect(result.matches).toEqual({ k3x: 'r1' });
    expect(result.missing).toEqual([]);
  });

  it('falls to otherwise when no row holds', async () => {
    runValues.priority = '2';

    const result = await applyAutomationConditionals({
      subdomain: 'test',
      execution,
      config,
      isInSegment: noSegments,
    });

    expect(result.config.assigneeId).toBe('[[ user.admin ]]');
    expect(result.matches).toEqual({ k3x: 'otherwise' });
  });

  it('patches every key the conditional owns, inside arrays too', async () => {
    runValues.priority = '4';

    const result = await applyAutomationConditionals({
      subdomain: 'test',
      execution,
      config: {
        rules: [
          {
            field: 'content',
            value: formatConditionalToken('m9a'),
            contentJson: { old: true },
          },
        ],
        [AUTOMATION_CONDITIONALS_KEY]: {
          m9a: {
            keys: ['value', 'contentJson'],
            rows: [
              {
                id: 'r1',
                conditions: [
                  {
                    kind: 'value',
                    left: '{{ priority }}',
                    operator: 'e',
                    right: '4',
                  },
                ],
                values: { value: '<p>Urgent</p>', contentJson: { urgent: 1 } },
              },
            ],
            otherwise: { value: '<p>Normal</p>', contentJson: {} },
          },
        },
      },
      isInSegment: noSegments,
    });

    expect(result.config).toEqual({
      rules: [
        {
          field: 'content',
          value: '<p>Urgent</p>',
          contentJson: { urgent: 1 },
        },
      ],
    });
  });

  it('decides a repeated condition once', async () => {
    runValues.priority = '1';
    const asked: string[] = [];

    await applyAutomationConditionals({
      subdomain: 'test',
      execution,
      config: {
        a: formatConditionalToken('one'),
        b: formatConditionalToken('two'),
        [AUTOMATION_CONDITIONALS_KEY]: {
          one: {
            keys: ['a'],
            rows: [
              {
                id: 'r1',
                conditions: [{ kind: 'segment', segmentId: 'seg-1' }],
                values: { a: 'x' },
              },
            ],
            otherwise: { a: 'y' },
          },
          two: {
            keys: ['b'],
            rows: [
              {
                id: 'r1',
                conditions: [{ kind: 'segment', segmentId: 'seg-1' }],
                values: { b: 'x' },
              },
            ],
            otherwise: { b: 'y' },
          },
        },
      },
      isInSegment: async (segmentId) => {
        asked.push(segmentId);
        return true;
      },
    });

    expect(asked).toEqual(['seg-1']);
  });

  it('reports a token whose rules are gone instead of passing it on', async () => {
    const result = await applyAutomationConditionals({
      subdomain: 'test',
      execution,
      config: { assigneeId: formatConditionalToken('gone') },
      isInSegment: noSegments,
    });

    expect(result.missing).toEqual(['gone']);
    expect(result.config.assigneeId).toBe('');
  });

  it('leaves a config without conditionals untouched', async () => {
    const result = await applyAutomationConditionals({
      subdomain: 'test',
      execution,
      config: { name: '{{ trigger.title }}', tags: ['a'] },
      isInSegment: noSegments,
    });

    expect(result.config).toEqual({ name: '{{ trigger.title }}', tags: ['a'] });
    expect(result.matches).toEqual({});
    expect(mockedReplace).not.toHaveBeenCalled();
  });
});
