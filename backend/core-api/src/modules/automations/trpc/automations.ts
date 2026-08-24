import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';

const t = initTRPC.context<CoreTRPCContext>().create();

// Agent-facing list reads must stay bounded: an unbounded find can
// materialize a whole collection in memory before the agent-tools response
// cap is able to reject the result.
const AGENT_LIST_DEFAULT_LIMIT = 20;
const AGENT_LIST_MAX_LIMIT = 100;

export const automationsRouter = t.router({
  automation: t.router({
    find: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ input, ctx }) => {
        const { query } = input;
        const { models } = ctx;
        return await models.Automations.find({
          'triggers.type': query.triggerType,
          'triggers.config.botId': query.botId,
          status: 'active',
        }).lean();
      }),

    count: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ input, ctx }) => {
        const { query } = input;
        const { models } = ctx;
        return await models.Automations.countDocuments(query);
      }),

    list: t.procedure
      .meta(
        agentMeta(
          'List automations with optional filters: { status?: "draft"|"active"|"archived", searchValue? (matches name), skip?, limit? }. Returns summary rows (_id, name, status, audit timestamps and authors, tagIds), newest first. Results are capped at 100 rows (default 20). Use automation.executionCounts to see how often an automation has run.',
          { module: 'automations', action: 'automationsRead' },
        ),
      )
      .input(
        z.object({
          status: z.enum(['draft', 'active', 'archived']).optional(),
          searchValue: z.string().max(200).optional(),
          skip: z.number().int().nonnegative().max(1_000_000).optional(),
          limit: z.number().int().positive().max(AGENT_LIST_MAX_LIMIT).optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const { models } = ctx;
        const { status, searchValue, skip, limit } = input;

        const query: Record<string, unknown> = {};

        if (status) {
          query.status = status;
        }

        if (searchValue) {
          query.name = new RegExp(escapeRegExp(searchValue), 'i');
        }

        return models.Automations.find(query)
          .select({
            name: 1,
            status: 1,
            tagIds: 1,
            createdAt: 1,
            createdBy: 1,
            updatedAt: 1,
            updatedBy: 1,
          })
          .sort({ createdAt: -1 })
          .skip(skip || 0)
          .limit(Math.min(limit || AGENT_LIST_DEFAULT_LIMIT, AGENT_LIST_MAX_LIMIT))
          .lean();
      }),

    executionCounts: t.procedure
      .meta(
        agentMeta(
          'Get how many times each automation has executed. Input: { automationIds: [...] } (1-100 ids, resolve them with automation.list). Returns exactly one { _id, count } row per requested id; never-executed automations report 0. Pair with automation.list for "what automations exist and how active are they" questions.',
          { module: 'automations', action: 'automationsRead' },
        ),
      )
      .input(
        z.object({
          automationIds: z.array(z.string()).min(1).max(AGENT_LIST_MAX_LIMIT),
        }),
      )
      .query(async ({ input, ctx }) => {
        const { models } = ctx;
        const ids = [...new Set(input.automationIds)];

        // getExecutionCounts returns rows only for automations with at least
        // one root execution; normalize so every requested id gets a row.
        const counts = await models.AutomationExecutions.getExecutionCounts(ids);
        const countById = new Map(counts.map((row) => [row.key, row.count]));

        return ids.map((id) => ({ _id: id, count: countById.get(id) ?? 0 }));
      }),
  }),
  executions: t.router({
    find: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ input, ctx }) => {
        const { ...query } = input;
        const { models } = ctx;
        return await models.AutomationExecutions.find(query);
      }),
  }),
});
