import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { OperationTRPCContext } from './init-trpc';

const t = initTRPC.context<OperationTRPCContext>().create();
type AgentContext = Awaited<ReturnType<OperationTRPCContext>>;
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);
const id = z.string().trim().min(1).max(100);
const page = {
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).max(10000).default(0),
};
const taskFilter = {
  teamId: objectId.optional(),
  projectId: objectId.optional(),
  status: objectId.optional(),
  assigneeId: id.optional(),
  priority: z.number().int().min(0).max(4).optional(),
};
const taskFields =
  '_id name number status statusType priority teamId projectId assigneeId createdBy targetDate createdAt updatedAt';

export const agentMeta = (
  description: string,
  permission: { module: string; action: string },
) => ({ agent: { description, permission } });
const procedure = (module: string, action: string, description: string) =>
  t.procedure
    .meta(agentMeta(description, { module, action }))
    .use(async ({ ctx, next }) => {
      if (!ctx.userId || !ctx.subdomain)
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      const user: IUserDocument | null = await sendTRPCMessage({
        subdomain: ctx.subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        method: 'query',
        input: { query: { _id: ctx.userId } },
        defaultValue: null,
      });
      if (!user || user._id !== ctx.userId)
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      await checkPermissionGroup(ctx.subdomain, user)(action);
      return next({ ctx: { ...ctx, user } });
    });
const teamIds = (ctx: AgentContext) =>
  ctx.models.TeamMember.find({ memberId: ctx.userId }).distinct('teamId');

export const operationAgentRouter = t.router({
  agent: t.router({
    tasks: procedure(
      'task',
      'taskRead',
      'List tasks in teams the acting user belongs to. Filter by team, project, status, assignee or priority; page with offset and limit.',
    )
      .input(z.object({ ...taskFilter, ...page }).strict())
      .query(async ({ ctx, input: { limit, offset, ...filter } }) =>
        ctx.models.Task.find({
          $and: [{ teamId: { $in: await teamIds(ctx) } }, filter],
        })
          .select(taskFields)
          .sort({ _id: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
      ),
    taskCount: procedure(
      'task',
      'taskRead',
      'Count matching tasks in the acting user’s teams without downloading task records.',
    )
      .input(z.object(taskFilter).strict())
      .query(async ({ ctx, input }) =>
        ctx.models.Task.countDocuments({
          $and: [{ teamId: { $in: await teamIds(ctx) } }, input],
        }),
      ),
    task: procedure(
      'task',
      'taskRead',
      'Get one task, including its description, by its 24-character ObjectId. Requires membership of its team.',
    )
      .input(z.object({ _id: objectId }).strict())
      .query(async ({ ctx, input }) => {
        const task = await ctx.models.Task.findOne({
          _id: input._id,
          teamId: { $in: await teamIds(ctx) },
        })
          .select(taskFields + ' description cycleId milestoneId estimatePoint')
          .lean();
        if (!task) throw new TRPCError({ code: 'NOT_FOUND' });
        return task;
      }),
    projects: procedure(
      'project',
      'projectRead',
      'List project summaries associated with the acting user’s teams. Page with offset and limit.',
    )
      .input(z.object({ ...page }).strict())
      .query(async ({ ctx, input }) =>
        ctx.models.Project.find({ teamIds: { $in: await teamIds(ctx) } })
          .select(
            '_id name status priority teamIds leadId targetDate startDate',
          )
          .sort({ _id: -1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean(),
      ),
    teams: procedure(
      'team',
      'teamRead',
      'List the acting user’s teams to discover IDs for task, status and cycle queries.',
    )
      .input(z.object(page).strict())
      .query(async ({ ctx, input }) =>
        ctx.models.Team.find({ _id: { $in: await teamIds(ctx) } })
          .select('_id name description cycleEnabled triageEnabled')
          .sort({ _id: 1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean(),
      ),
    statuses: procedure(
      'status',
      'statusRead',
      'List statuses for the acting user’s teams, optionally narrowed to a team ID.',
    )
      .input(z.object({ teamId: objectId.optional(), ...page }).strict())
      .query(async ({ ctx, input: { limit, offset, ...filter } }) =>
        ctx.models.Status.find({
          $and: [{ teamId: { $in: await teamIds(ctx) } }, filter],
        })
          .select('_id name type teamId order')
          .sort({ _id: 1 })
          .skip(offset)
          .limit(limit)
          .lean(),
      ),
    cycles: procedure(
      'cycle',
      'cycleRead',
      'List cycle dates and progress flags in the acting user’s teams, optionally narrowed to a team ID.',
    )
      .input(z.object({ teamId: objectId.optional(), ...page }).strict())
      .query(async ({ ctx, input: { limit, offset, ...filter } }) =>
        ctx.models.Cycle.find({
          $and: [{ teamId: { $in: await teamIds(ctx) } }, filter],
        })
          .select(
            '_id name teamId startDate endDate isActive isCompleted donePercent',
          )
          .sort({ _id: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
      ),
    milestones: procedure(
      'milestone',
      'milestoneRead',
      'List milestones for one project associated with the acting user’s teams.',
    )
      .input(z.object({ projectId: objectId, ...page }).strict())
      .query(async ({ ctx, input }) => {
        const project = await ctx.models.Project.exists({
          _id: input.projectId,
          teamIds: { $in: await teamIds(ctx) },
        });
        if (!project) throw new TRPCError({ code: 'NOT_FOUND' });
        return ctx.models.Milestone.find({ projectId: input.projectId })
          .select('_id name targetDate projectId')
          .sort({ _id: 1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();
      }),
  }),
});
