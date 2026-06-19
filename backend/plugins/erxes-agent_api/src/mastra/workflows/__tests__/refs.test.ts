import { collectRefs, checkRef, resolveValue, RefScope } from '../refs';

const scope: RefScope = {
  trigger: { payload: { text: 'hello', amount: 5000 }, type: 'manual' },
  steps: {
    classify: { output: { intent: 'order', productName: 'Chair' } },
    lookup: { output: { list: [{ _id: 'p1' }], totalCount: 1 } },
  },
  bindings: { supportAgent: { kind: 'agent', id: 'agent-123' } },
};

describe('refs', () => {
  describe('collectRefs', () => {
    it('finds refs nested in objects, arrays and interpolations', () => {
      const refs = collectRefs({
        a: '{{trigger.payload.text}}',
        b: ['x', 'Order: {{steps.classify.output.productName}}'],
        c: { d: '{{bindings.supportAgent}}' },
      });
      expect(refs.sort((a, b) => a.localeCompare(b))).toEqual([
        'bindings.supportAgent',
        'steps.classify.output.productName',
        'trigger.payload.text',
      ]);
    });

    it('returns empty for ref-free values', () => {
      expect(collectRefs({ a: 1, b: 'plain', c: [true] })).toEqual([]);
    });
  });

  describe('checkRef', () => {
    const prior = new Set(['classify']);
    const bindings = new Set(['supportAgent']);

    it('accepts trigger, prior-step output and known bindings', () => {
      expect(checkRef('trigger.payload.text', prior, bindings)).toBeNull();
      expect(
        checkRef('steps.classify.output.intent', prior, bindings),
      ).toBeNull();
      expect(checkRef('bindings.supportAgent', prior, bindings)).toBeNull();
    });

    it('rejects unknown roots', () => {
      expect(checkRef('env.SECRET', prior, bindings)).toMatch(
        /unknown ref root/,
      );
    });

    it('rejects refs to steps that have not executed yet', () => {
      expect(checkRef('steps.later.output.x', prior, bindings)).toMatch(
        /does not execute before/,
      );
    });

    it('rejects step refs that do not read output', () => {
      expect(checkRef('steps.classify.intent', prior, bindings)).toMatch(
        /must read a step's output/,
      );
    });

    it('rejects unknown bindings', () => {
      expect(checkRef('bindings.ghost', prior, bindings)).toMatch(
        /unknown binding/,
      );
    });
  });

  describe('resolveValue', () => {
    it('whole-string refs return the raw value (objects, numbers)', () => {
      expect(resolveValue('{{trigger.payload.amount}}', scope)).toBe(5000);
      expect(resolveValue('{{steps.lookup.output.list}}', scope)).toEqual([
        { _id: 'p1' },
      ]);
    });

    it('embedded refs interpolate as strings', () => {
      expect(
        resolveValue('Order: {{steps.classify.output.productName}}!', scope),
      ).toBe('Order: Chair!');
    });

    it('binding refs resolve to the bound id, keeping definitions portable', () => {
      expect(resolveValue('{{bindings.supportAgent}}', scope)).toBe(
        'agent-123',
      );
    });

    it('resolves deeply through objects and arrays', () => {
      expect(
        resolveValue(
          {
            name: '{{steps.classify.output.productName}}',
            ids: ['{{trigger.payload.amount}}'],
          },
          scope,
        ),
      ).toEqual({ name: 'Chair', ids: [5000] });
    });

    it('missing paths resolve to undefined (whole) / empty string (embedded)', () => {
      expect(
        resolveValue('{{trigger.payload.missing}}', scope),
      ).toBeUndefined();
      expect(resolveValue('x={{trigger.payload.missing}}', scope)).toBe('x=');
    });

    it('non-string scalars pass through untouched', () => {
      expect(resolveValue(42, scope)).toBe(42);
      expect(resolveValue(true, scope)).toBe(true);
      expect(resolveValue(null, scope)).toBeNull();
    });
  });
});
