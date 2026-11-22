import { automations } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { MAX_CHAIN_DEPTH } from '../consumer';
import { definitionOf } from '../runs';
import { startNow } from '../triggers';
import { type CoreAction, parseInput } from './context';

const StartInput = z.object({
  automation: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const AUTOMATION_ACTIONS: CoreAction[] = [
  {
    type: 'core.automation.start',
    label: 'Start another automation',
    description: 'Start an automation that has the manual trigger, about the same record',
    subject: null,
    fields: [
      { key: 'automation', label: 'Automation', type: 'automation', required: true },
      {
        key: 'data',
        label: 'Data to pass',
        type: 'json',
        required: false,
        description: 'Values the other automation’s steps can use',
      },
    ],
    outputs: [{ key: 'started', label: 'Runs started', type: 'number' }],
    run: async (ctx) => {
      const input = parseInput(ctx, StartInput);
      const depth = ctx.run.depth + 1;

      if (input.automation === ctx.automation.id)
        throw fail('INVALID_STEP_INPUT', 'An automation can’t start itself');

      if (depth >= MAX_CHAIN_DEPTH)
        throw fail(
          'LIMIT_EXCEEDED',
          `Automations start each other at most ${MAX_CHAIN_DEPTH} deep`,
        );

      const [target] = await ctx.tx
        .select()
        .from(automations)
        .where(eq(automations.id, input.automation))
        .limit(1);

      const definition =
        target?.status === 'active' && target.activeVersion
          ? await definitionOf(ctx.tx, target.id, target.activeVersion)
          : null;

      if (!target || !definition) throw fail('NOT_ACTIVE', 'The automation to start is not on');

      if (definition.trigger.kind !== 'manual')
        throw fail('INVALID_STEP_INPUT', `“${target.name}” needs the manual trigger to be started`);

      return startNow(ctx.tx, target, definition, {
        subjects: ctx.subject ? [ctx.subject.id] : undefined,
        subjectType: ctx.subject?.type,
        key: `run:${ctx.run.id}:${ctx.step.id}`,
        data: input.data,
        depth,
      });
    },
  },
];
