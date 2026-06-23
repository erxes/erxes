import { validateDefinition, buildOutputZod, MAX_STEPS } from '../dsl';
import type {
  OperationRegistry,
  OperationMeta,
} from '../../tools/operationRegistry';

/** A freely mutable draft step — tests rewrite arbitrary fields on it. */
interface DraftStep {
  id: string;
  type: string;
  [key: string]: unknown;
}

/** A freely mutable draft definition for exercising validateDefinition. */
interface DraftDefinition {
  trigger: { type: string; config: Record<string, unknown> };
  policy: { mode: string; allowed: string[] };
  bindings: Record<string, { kind: string; id: string }>;
  limits: { maxLlmCalls: number };
  steps: DraftStep[];
}

const validDef = (): DraftDefinition => ({
  trigger: { type: 'manual', config: {} },
  policy: { mode: 'all', allowed: [] },
  bindings: { judge: { kind: 'agent', id: 'a1' } },
  limits: { maxLlmCalls: 5 },
  steps: [
    {
      id: 'classify',
      type: 'agent',
      agentRef: 'judge',
      prompt: 'Classify: {{trigger.payload.text}}',
      outputSchema: {
        intent: 'enum:order,question',
        reply: 'string',
        note: 'string?',
      },
    },
    {
      id: 'create',
      type: 'operation',
      operation: 'dealsAdd',
      args: { name: '{{steps.classify.output.reply}}' },
    },
    { id: 'done', type: 'end' },
  ],
});

const mkRegistry = (ops: Array<Partial<OperationMeta>>): OperationRegistry => {
  const list = ops.map(
    (o) =>
      ({
        operation: o.operation || 'x',
        operationType: o.operationType || 'mutation',
        plugin: o.plugin || 'sales',
        module: o.module || 'deals',
        description: '',
        graphqlArgs: [],
        returnType: null,
      } as OperationMeta),
  );
  return {
    operations: new Map(list.map((o) => [o.operation, o])),
    list,
    inputTypesMap: {},
    objectFieldsMap: {},
  };
};

describe('workflow DSL', () => {
  it('accepts a valid linear definition', () => {
    const result = validateDefinition(validDef());
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.definition?.steps).toHaveLength(3);
  });

  it('rejects non-object garbage with schema errors', () => {
    const result = validateDefinition({ steps: 'nope' });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects duplicate step ids', () => {
    const def = validDef();
    def.steps[1].id = 'classify';
    const result = validateDefinition(def);
    expect(result.errors.some((e) => /duplicate step id/.test(e.message))).toBe(
      true,
    );
  });

  it('rejects refs to steps that execute later', () => {
    const def = validDef();
    def.steps[0].prompt = 'see {{steps.create.output.x}}';
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) => /does not execute before/.test(e.message)),
    ).toBe(true);
  });

  it('rejects unknown binding refs and non-agent bindings', () => {
    const def = validDef();
    def.steps[0].agentRef = 'ghost';
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) => /no entry in bindings/.test(e.message)),
    ).toBe(true);
  });

  it('rejects step types the compiler cannot execute yet', () => {
    const def = validDef();
    def.steps.splice(1, 0, {
      id: 'gate',
      type: 'approval',
      message: 'ok?',
    });
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) =>
        /not supported by the compiler yet/.test(e.message),
      ),
    ).toBe(true);
  });

  it('requires "end" to be the last step', () => {
    const def = validDef();
    def.steps.unshift({ id: 'early', type: 'end' });
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) => /must be the last step/.test(e.message)),
    ).toBe(true);
  });

  it('with a registry: rejects nonexistent operations', () => {
    const result = validateDefinition(
      validDef(),
      mkRegistry([{ operation: 'somethingElse' }]),
    );
    expect(
      result.errors.some((e) =>
        /does not exist on this instance/.test(e.message),
      ),
    ).toBe(true);
  });

  it('with a registry: rejects operations outside a custom policy', () => {
    const def = validDef();
    def.policy = { mode: 'custom', allowed: ['plugin:frontline'] };
    const result = validateDefinition(
      def,
      mkRegistry([{ operation: 'dealsAdd', plugin: 'sales', module: 'deals' }]),
    );
    expect(
      result.errors.some((e) =>
        /outside this workflow's policy/.test(e.message),
      ),
    ).toBe(true);
  });

  it('with a registry: accepts operations covered by plugin: policy entries', () => {
    const def = validDef();
    def.policy = { mode: 'custom', allowed: ['plugin:sales'] };
    const result = validateDefinition(
      def,
      mkRegistry([{ operation: 'dealsAdd', plugin: 'sales', module: 'deals' }]),
    );
    expect(result.errors).toEqual([]);
  });

  it('enforces the step count cap', () => {
    const def = validDef();
    def.steps = Array.from({ length: MAX_STEPS + 1 }, (_, i) => ({
      id: `s${i}`,
      type: 'end',
    }));
    const result = validateDefinition(def);
    expect(result.ok).toBe(false);
  });

  it('rejects malformed agent output field specs', () => {
    const def = validDef();
    def.steps[0].outputSchema = { intent: 'object' };
    const result = validateDefinition(def);
    expect(result.ok).toBe(false);
  });
});

describe('buildOutputZod', () => {
  const schema = buildOutputZod({
    intent: 'enum:order,question',
    reply: 'string',
    score: 'number?',
    urgent: 'boolean',
  });

  it('accepts conforming output', () => {
    const parsed = schema.safeParse({
      intent: 'order',
      reply: 'hi',
      urgent: false,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects out-of-enum values and missing required fields', () => {
    expect(
      schema.safeParse({ intent: 'refund', reply: 'hi', urgent: true }).success,
    ).toBe(false);
    expect(schema.safeParse({ intent: 'order', urgent: true }).success).toBe(
      false,
    );
  });
});

describe('schedule trigger validation', () => {
  it('requires a cron expression on schedule triggers', () => {
    const def = validDef();
    def.trigger = { type: 'schedule', config: {} };
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) => /requires config\.cron/.test(e.message)),
    ).toBe(true);
  });

  it('accepts a 5-field cron and rejects garbage', () => {
    const def = validDef();
    def.trigger = { type: 'schedule', config: { cron: '0 9 * * *' } };
    expect(validateDefinition(def).ok).toBe(true);

    def.trigger = {
      type: 'schedule',
      config: { cron: 'every morning' },
    };
    expect(
      validateDefinition(def).errors.some((e) =>
        /requires config\.cron/.test(e.message),
      ),
    ).toBe(true);
  });
});

describe('review fixes', () => {
  it('rejects bracket-indexed refs as malformed (dot paths only)', () => {
    const def = validDef();
    def.steps[1].args = { name: '{{steps.classify.output.items[0]}}' };
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) => /malformed reference/.test(e.message)),
    ).toBe(true);
  });

  it('rejects wait steps until the resume worker ships', () => {
    const def = validDef();
    def.steps.splice(1, 0, {
      id: 'pause',
      type: 'wait',
      duration: 1000,
    });
    const result = validateDefinition(def);
    expect(
      result.errors.some((e) =>
        /not supported by the compiler yet/.test(e.message),
      ),
    ).toBe(true);
  });
});
