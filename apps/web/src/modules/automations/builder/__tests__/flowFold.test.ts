import type { AutomationStep } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { foldedAtStart } from '../flowFold';

const anyRule = { match: 'all' as const, rules: [] };

const note = (id: string): AutomationStep => ({
  id,
  type: 'action',
  action: 'core.note.add',
  input: {},
});

const branch = (id: string): AutomationStep => ({
  id,
  type: 'branch',
  conditions: anyRule,
  then: [note(`${id}y`)],
  else: [note(`${id}n`)],
});

const choose = (id: string, cases: AutomationStep[][]): AutomationStep => ({
  id,
  type: 'switch',
  cases: cases.map((steps) => ({ conditions: anyRule, steps })),
  otherwise: [note(`${id}o`)],
});

describe('foldedAtStart', () => {
  it('opens everything in a flow that fits', () => {
    expect([...foldedAtStart([choose('top', [[branch('a')], [branch('b')]])])]).toEqual([]);
  });

  it('keeps the top level open and folds the deeper paths of a wide flow', () => {
    const inner = (id: string) => choose(id, [[branch(`${id}1`)], [branch(`${id}2`)]]);
    const flow = [choose('top', [[inner('f')], [inner('b')], [inner('i')], [inner('x')]])];

    const folded = foldedAtStart(flow);

    expect(folded.has('top')).toBe(false);
    expect([...folded].toSorted()).toEqual([
      'b',
      'b1',
      'b2',
      'f',
      'f1',
      'f2',
      'i',
      'i1',
      'i2',
      'x',
      'x1',
      'x2',
    ]);
  });

  it('opens deeper paths in order until the flow would pass six cards wide', () => {
    const flow = [choose('top', [[choose('a', [[branch('p')], [branch('q')]])], [note('n')]])];

    expect([...foldedAtStart(flow)]).toEqual(['q']);
  });
});
