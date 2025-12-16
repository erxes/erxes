import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';

export type GoalsTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<GoalsTRPCContext>().create();

function applyInFilter(
  filter: Record<string, any>,
  field: string,
  values?: string[]
) {
  if (values?.length) {
    filter[field] = { $in: values };
  }
}

function applyScalarFilters(
  filter: Record<string, any>,
  input: {
    entity?: string;
    metric?: string;
    periodGoal?: string;
    teamGoalType?: string;
    contributionType?: string;
  }
) {
  if (input.entity) filter.entity = input.entity;
  if (input.metric) filter.metric = input.metric;
  if (input.periodGoal) filter.periodGoal = input.periodGoal;
  if (input.teamGoalType) filter.teamGoalType = input.teamGoalType;
  if (input.contributionType) filter.contributionType = input.contributionType;
}

function applyDateFilter(
  filter: Record<string, any>,
  startDate?: Date,
  endDate?: Date
) {
  if (!startDate && !endDate) {
    return;
  }

  filter.$and = [];

  if (startDate) {
    filter.$and.push({ endDate: { $gte: startDate } });
  }

  if (endDate) {
    filter.$and.push({ startDate: { $lte: endDate } });
  }
}

export const goalsTrpcRouter = t.router({
  goals: t.router({

    find: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          page: z.number().optional().default(1),
          perPage: z.number().optional().default(20),
          branch: z.array(z.string()).optional(),
          department: z.array(z.string()).optional(),
          unit: z.array(z.string()).optional(),
          contribution: z.array(z.string()).optional(),
          date: z.date().optional(),
          endDate: z.date().optional(),
          entity: z.string().optional(),
          metric: z.string().optional(),
          periodGoal: z.string().optional(),
          teamGoalType: z.string().optional(),
          contributionType: z.string().optional()
        })
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        const filter: Record<string, any> = {
          subdomain: input.subdomain
        };

        applyInFilter(filter, 'branch', input.branch);
        applyInFilter(filter, 'department', input.department);
        applyInFilter(filter, 'unit', input.unit);
        applyInFilter(filter, 'contribution', input.contribution);

        applyScalarFilters(filter, {
          entity: input.entity,
          metric: input.metric,
          periodGoal: input.periodGoal,
          teamGoalType: input.teamGoalType,
          contributionType: input.contributionType
        });

        applyDateFilter(filter, input.date, input.endDate);

        const skip = (input.page - 1) * input.perPage;

        const goals = await models.Goals.find(filter)
          .skip(skip)
          .limit(input.perPage)
          .lean();

        const totalCount = await models.Goals.countDocuments(filter);

        return {
          status: 'success',
          data: {
            list: goals,
            totalCount,
            page: input.page,
            perPage: input.perPage,
            totalPages: Math.ceil(totalCount / input.perPage)
          }
        };
      }),

    get: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          _id: z.string()
        })
      )
      .query(async ({ ctx, input }) => {
        const goal = await ctx.models.Goals.findOne({
          _id: input._id,
          subdomain: input.subdomain
        }).lean();

        if (!goal) {
          throw new Error('Goal not found');
        }

        return {
          status: 'success',
          data: goal
        };
      }),

    /* ---------- CREATE ---------- */
    create: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          goal: z.object({
            name: z.string(),
            entity: z.string(),
            contributionType: z.string(),
            stageId: z.string().optional(),
            pipelineId: z.string().optional(),
            boardId: z.string().optional(),
            metric: z.string(),
            goalTypeChoose: z.string().optional(),
            contribution: z.array(z.string()).optional(),
            department: z.array(z.string()).optional(),
            unit: z.array(z.string()).optional(),
            branch: z.array(z.string()).optional(),
            specificPeriodGoals: z.any().optional(),
            startDate: z.date(),
            endDate: z.date(),
            stageRadio: z.boolean().optional(),
            segmentRadio: z.boolean().optional(),
            segmentIds: z.array(z.string()).optional(),
            periodGoal: z.string(),
            teamGoalType: z.string().optional(),
            segmentCount: z.number().optional(),
            pipelineLabels: z.any().optional(),
            productIds: z.array(z.string()).optional(),
            companyIds: z.array(z.string()).optional(),
            tagsIds: z.array(z.string()).optional()
          })
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const goal = await models.Goals.create({
          ...input.goal,
          subdomain,
          createdAt: new Date()
        });

        return {
          status: 'success',
          data: goal
        };
      }),

    /* ---------- UPDATE ---------- */
    update: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          _id: z.string(),
          goal: z.object({
            name: z.string().optional(),
            entity: z.string().optional(),
            contributionType: z.string().optional(),
            stageId: z.string().optional(),
            pipelineId: z.string().optional(),
            boardId: z.string().optional(),
            metric: z.string().optional(),
            goalTypeChoose: z.string().optional(),
            contribution: z.array(z.string()).optional(),
            department: z.array(z.string()).optional(),
            unit: z.array(z.string()).optional(),
            branch: z.array(z.string()).optional(),
            specificPeriodGoals: z.any().optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            stageRadio: z.boolean().optional(),
            segmentRadio: z.boolean().optional(),
            segmentIds: z.array(z.string()).optional(),
            periodGoal: z.string().optional(),
            teamGoalType: z.string().optional(),
            segmentCount: z.number().optional(),
            pipelineLabels: z.any().optional(),
            productIds: z.array(z.string()).optional(),
            companyIds: z.array(z.string()).optional(),
            tagsIds: z.array(z.string()).optional()
          })
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        await models.Goals.updateOne(
          { _id: input._id, subdomain: input.subdomain },
          { $set: input.goal },
          { runValidators: true }
        );

        const updatedGoal = await models.Goals.findOne({
          _id: input._id,
          subdomain: input.subdomain
        }).lean();

        return {
          status: 'success',
          data: updatedGoal
        };
      }),

    /* ---------- DELETE ---------- */
    delete: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          goalIds: z.array(z.string())
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        const result = await models.Goals.deleteMany({
          _id: { $in: input.goalIds },
          subdomain: input.subdomain
        });

        return {
          status: 'success',
          data: {
            deletedCount: result.deletedCount,
            goalIds: input.goalIds
          }
        };
      }),


    progressIds: t.procedure
      .input(
        z.object({
          subdomain: z.string(),
          filter: z.any().optional(),
          params: z
            .object({
              page: z.number().optional().default(1),
              perPage: z.number().optional().default(20)
            })
            .optional()
        })
      )
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const filter = input.filter || {};
        filter.subdomain = subdomain;

        const params = input.params || { page: 1, perPage: 20 };

        const progressIds = await models.Goals.progressIdsGoals(filter, params);

        return {
          status: 'success',
          data: progressIds
        };
      })
  })
});
