import { parseExpr, evalExpr, exprRefs, evaluateCondition } from '../expr';
import { RefScope } from '../refs';

const scope: RefScope = {
  trigger: {
    payload: { amount: 5000, kind: 'facebook', vip: true, tags: ['a', 'b'] },
  },
  steps: { classify: { output: { intent: 'order', score: 0.9 } } },
  bindings: {},
};

const ev = (src: string) => evaluateCondition(src, scope);

describe('expression language', () => {
  it('compares refs to string literals (the canonical branch shape)', () => {
    expect(ev("{{steps.classify.output.intent}} == 'order'")).toBe(true);
    expect(ev("{{steps.classify.output.intent}} == 'question'")).toBe(false);
    expect(ev('{{steps.classify.output.intent}} != "question"')).toBe(true);
  });

  it('handles numeric comparison operators', () => {
    expect(ev('{{trigger.payload.amount}} > 1000')).toBe(true);
    expect(ev('{{trigger.payload.amount}} <= 4999')).toBe(false);
    expect(ev('{{trigger.payload.amount}} >= 5000')).toBe(true);
  });

  it('coerces number↔string equality (LLM-authored definitions do this)', () => {
    expect(ev("{{trigger.payload.amount}} == '5000'")).toBe(true);
  });

  it('handles boolean logic with precedence (&& binds tighter than ||)', () => {
    expect(
      ev('{{trigger.payload.vip}} && {{trigger.payload.amount}} > 100'),
    ).toBe(true);
    expect(ev('false || true && false')).toBe(false);
    expect(ev('(false || true) && true')).toBe(true);
    expect(ev('!{{trigger.payload.vip}}')).toBe(false);
  });

  it('supports "in" for arrays and strings', () => {
    expect(ev("'a' in {{trigger.payload.tags}}")).toBe(true);
    expect(ev("'z' in {{trigger.payload.tags}}")).toBe(false);
    expect(ev("'book' in 'facebook'")).toBe(true);
  });

  it('treats missing refs as undefined (falsy, != matches)', () => {
    expect(ev('{{trigger.payload.missing}} == null')).toBe(false); // undefined !== null
    expect(ev("{{trigger.payload.missing}} != 'x'")).toBe(true);
    expect(ev('!{{trigger.payload.missing}}')).toBe(true);
  });

  it('rejects anything outside the grammar', () => {
    expect(() => parseExpr('process.exit(1)')).toThrow();
    expect(() => parseExpr('a === b')).toThrow();
    expect(() => parseExpr("'unterminated")).toThrow();
    expect(() => parseExpr('{{a}} == {{b}} extra')).toThrow(/unknown word/);
    expect(() => parseExpr('{{a}} == {{b}} 5')).toThrow(/trailing tokens/);
    expect(() => parseExpr('')).toThrow();
  });

  it('exposes its refs for compile-time integrity checks', () => {
    const ast = parseExpr(
      "{{steps.classify.output.intent}} == 'order' && {{trigger.payload.vip}}",
    );
    expect(exprRefs(ast).sort((a, b) => a.localeCompare(b))).toEqual([
      'steps.classify.output.intent',
      'trigger.payload.vip',
    ]);
  });

  it('evalExpr returns raw values for non-boolean nodes', () => {
    expect(evalExpr(parseExpr('{{trigger.payload.amount}}'), scope)).toBe(5000);
  });
});
