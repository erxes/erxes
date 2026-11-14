import { automations, leadStages } from '@erxes/core-db';
import { eq, or, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { updateCustomer } from '~/modules/customers/customers.service';
import { type CoreAction, list, needSubject, text } from './context';

/** Round-robin positions per step, kept in the automation's working state. */
/** Actions on a customer's lead lifecycle and ownership. */
export const LEAD_ACTIONS: CoreAction[] = [
  {
    type: 'core.lead.move',
    label: 'Move the lead to a stage',
    description: 'Move the lead to one of your lead stages',
    subject: 'customer',
    fields: [
      { key: 'stage', label: 'Stage', type: 'lead_stage', required: true },
      {
        key: 'reason',
        label: 'Reason',
        type: 'text',
        required: false,
        description: 'Kept when the stage is a disqualified one',
      },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      // A stage id (the picker), or a stage's name.
      const wanted = text(ctx.input.stage)?.trim() ?? '';

      const [stage] = await ctx.tx
        .select({ id: leadStages.id })
        .from(leadStages)
        .where(
          or(eq(leadStages.id, wanted), sql`lower(${leadStages.name}) = ${wanted.toLowerCase()}`),
        )
        .orderBy(sql`${leadStages.id} = ${wanted} desc`)
        .limit(1);

      if (!stage) throw fail('INVALID_LEAD_STAGE', `No lead stage is called “${wanted}”`);

      const reason = text(ctx.input.reason);

      await updateCustomer(ctx.tx, id, {
        leadStageId: stage.id,
        ...(reason ? { disqualifyReason: reason } : {}),
      });

      return { stageId: stage.id };
    },
  },
  {
    type: 'core.lead.convert',
    label: 'Convert the lead to a customer',
    description: 'The lead becomes a customer (nothing happens if it already is one)',
    subject: 'customer',
    fields: [],
    run: async (ctx) => {
      await updateCustomer(ctx.tx, needSubject(ctx, 'customer'), { state: 'customer' });

      return { converted: true };
    },
  },
  {
    type: 'core.customer.assign',
    label: 'Assign an owner (round-robin)',
    description: 'Give the customer to the next member in turn',
    subject: 'customer',
    fields: [
      { key: 'userIds', label: 'Members to rotate through', type: 'members', required: true },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      const members = list(ctx.input.userIds);

      // The row lock means no two runs take the same turn.
      const [row] = await ctx.tx
        .select({ state: automations.state })
        .from(automations)
        .where(eq(automations.id, ctx.automation.id))
        .for('update')
        .limit(1);

      const turns = row?.state.turns ?? {};
      const position = (turns[ctx.step.id] ?? -1) + 1;
      const ownerId = members[position % members.length];

      if (!ownerId) throw fail('NO_MEMBERS', 'Choose the members to rotate through');

      await ctx.tx
        .update(automations)
        .set({
          state: sql`jsonb_set(${automations.state}, '{turns}', ${JSON.stringify({ ...turns, [ctx.step.id]: position })}::jsonb)`,
        })
        .where(eq(automations.id, ctx.automation.id));
      await updateCustomer(ctx.tx, id, { ownerId });

      return { ownerId };
    },
  },
];
