import { TAutomationConditional } from '../types/conditionalTypes';
import {
  collectConditionalTokenIds,
  finalizeAutomationConditionals,
  formatConditionalToken,
  parseConditionalToken,
  validateAutomationConditional,
} from './conditionalUtils';

// Token and validation cases match erxes-api-shared conditionals.test.ts

const complete: TAutomationConditional = {
  keys: ['value', 'meta'],
  label: 'Value',
  required: true,
  rows: [
    {
      id: 'r1',
      conditions: [{ kind: 'segment', segmentId: 'seg-1' }],
      values: { value: 'stage-a', meta: { pipelineId: 'p1' } },
    },
  ],
  otherwise: { value: 'stage-b', meta: {} },
};

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

describe('validateAutomationConditional', () => {
  it('accepts a complete conditional', () => {
    expect(validateAutomationConditional(complete)).toEqual([]);
  });

  it('names every missing piece', () => {
    expect(
      validateAutomationConditional({
        keys: ['assigneeId'],
        required: true,
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
      }),
    ).toEqual([
      'Row 1, condition 1: pick a value to check',
      'Row 1, condition 1: enter a value to compare with',
      'Row 1, condition 3: pick a segment',
      'Row 1: set a value',
      'Row 2: add at least one condition',
      'Otherwise: set a value',
    ]);
  });
});

describe('finalizeAutomationConditionals', () => {
  const config = {
    rules: [
      { field: 'stageId', value: formatConditionalToken('k3x') },
      { field: 'name', value: 'plain' },
    ],
  };

  it('keeps only the conditionals the config still points at', () => {
    const { conditionals, errors } = finalizeAutomationConditionals(config, {
      k3x: complete,
      orphan: complete,
    });

    expect(Object.keys(conditionals)).toEqual(['k3x']);
    expect(errors).toEqual({});
  });

  it('reports an incomplete or missing conditional', () => {
    const { errors } = finalizeAutomationConditionals(
      { a: formatConditionalToken('k3x'), b: formatConditionalToken('gone') },
      { k3x: { ...complete, rows: [] } },
    );

    expect(errors).toEqual({
      k3x: ['Add at least one condition row'],
      gone: ['This value lost its conditions; set it again'],
    });
  });

  it('does not look inside the conditionals themselves', () => {
    expect(
      collectConditionalTokenIds({
        a: formatConditionalToken('k3x'),
        _conditionals: {
          k3x: { otherwise: { a: formatConditionalToken('x') } },
        },
      }),
    ).toEqual(['k3x']);
  });
});
