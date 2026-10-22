import { initTRPC, TRPCError } from '@trpc/server';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import {
  addDeal,
  changeDeal,
  editDeal,
} from '~/modules/sales/graphql/resolvers/mutations/utils';
import { generateFilter } from '~/modules/sales/graphql/resolvers/queries/deals';
import { subscriptionWrapper } from '~/modules/sales/graphql/resolvers/utils';
import {
  convertNestedDate,
  generateAmounts,
  generateProducts,
} from '~/modules/sales/utils';
import { replaceDealContent } from '~/modules/sales/documents/dealContent';
import { syncWrittenDealPoints } from '~/modules/sales/utils/dealPoints';
import {
  assertDealUpdatesAllowed,
  SalesArchiveError,
} from '~/modules/sales/utils/archiveGuard';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        ...(error.cause instanceof SalesArchiveError
          ? {
              archiveCode: error.cause.code,
              entityType: error.cause.extensions.entityType,
              entityId: error.cause.extensions.entityId,
            }
          : {}),
      },
    };
  },
});

const salesProcedure = t.procedure.use(async ({ next }) => {
  const result = await next();
  if (!result.ok && result.error.cause instanceof SalesArchiveError) {
    const cause = result.error.cause;
    throw new TRPCError({
      code: cause.code === 'SALES_BOARD_ARCHIVING' ? 'CONFLICT' : 'FORBIDDEN',
      message: cause.message,
      cause,
    });
  }
  return result;
});

const agentRecordId = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const agentIdList = z.array(agentRecordId).max(20);
const agentIsoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Use an ISO date such as "2026-11-15"',
  });
const agentShortText = z.string().trim().min(1).max(200);
const agentDescriptionText = z.string().trim().max(5000);

// Every agent write runs as the user whose chat session issued it; the
// HMAC-signed context carries that user's id, resolved through core.
const requireAgentUser = async (ctx: {
  subdomain: string;
  userId?: string;
}): Promise<IUserDocument> => {
  const user = ctx.userId
    ? ((await sendTRPCMessage({
        subdomain: ctx.subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: { query: { _id: ctx.userId, isActive: { $ne: false } } },
        defaultValue: null,
      })) as IUserDocument | null)
    : null;

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Acting user not found',
    });
  }

  return user;
};

const publishDealSubscription = t.procedure
  .input(z.any())
  .mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    const { action, deal, oldDeal, dealId, pipelineId, oldPipelineId } = input;

    await subscriptionWrapper(models, {
      action,
      deal,
      oldDeal,
      dealId,
      pipelineId,
      oldPipelineId,
    });

    return null;
  });

const createDealProcedure = salesProcedure
  .input(z.any())
  .mutation(async ({ ctx, input }) => {
    const { models, subdomain } = ctx;
    const deal = await models.Deals.createDeal(input);

    await syncWrittenDealPoints({
      subdomain,
      models,
      dealIds: [deal._id],
      userId: input?.userId,
    });

    return deal;
  });

const updateDealProcedure = salesProcedure
  .input(z.any())
  .mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    const { selector, modifier } = input;

    if (!selector || !Object.keys(selector).length) {
      return null;
    }

    const updateDoc =
      modifier && Object.keys(modifier).some((key) => key.startsWith('$'))
        ? modifier
        : { $set: modifier };

    const before = await models.Deals.findOne(selector).lean();
    if (!before) return null;
    await assertDealUpdatesAllowed(models, [before], updateDoc);
    const updated = await models.Deals.findOneAndUpdate(
      { $and: [selector, { _id: before._id }] },
      updateDoc,
      { new: true },
    );

    if (updated) {
      await syncWrittenDealPoints({
        subdomain: ctx.subdomain,
        models,
        before: [before],
      });
    }

    return updated;
  });

export const dealTrpcRouter = t.router({
  deal: {
    findOne: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.Deals.findOne(input).lean();
      }),

    find: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        const { query, skip, limit, sort = {} } = input;

        if (!query) {
          return await models.Deals.find(input).lean();
        }

        return await models.Deals.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean();
      }),

    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return await models.Deals.aggregate(convertNestedDate(input));
    }),

    count: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return await models.Deals.find(input).countDocuments();
      }),

    getLink: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { _id } = input;
        const item = await models.Deals.findOne({ _id });

        if (!item) {
          throw new Error('Deal not found');
        }

        const stage = await models.Stages.getStage(item.stageId);
        const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
        const board = await models.Boards.getBoard(pipeline.boardId);

        return `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${_id}`;
      }),

    findDealProductIds: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { _ids } = input;

        const dealProductIds = await await models.Deals.find({
          'productsData.productId': { $in: _ids },
        }).distinct('productsData.productId');

        return dealProductIds;
      }),

    createItem: salesProcedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { user, processId, ...doc } = input;
        if (!user || !processId) {
          throw new Error('you must provide some params');
        }
        return await addDeal({ models, subdomain, user, doc });
      }),

    editItem: salesProcedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;

      const { itemId, processId, user, ...doc } = input;

      if (!itemId || !user || !processId) {
        throw new Error('you must provide some params');
      }

      return await editDeal({
        models,
        subdomain,
        _id: itemId,
        doc,
        processId,
        user,
      });
    }),

    removeItem: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _ids } = input;

      return await models.Deals.removeDeals(_ids);
    }),

    contentIds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { pipelineId } = input;
      const { models } = ctx;

      const stageIds = await models.Stages.find({ pipelineId }).distinct('_id');

      return await models.Deals.find({ stageId: { $in: stageIds } }).distinct(
        '_id',
      );
    }),

    generateInternalNoteNotif: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { contentTypeId, notifDoc, type } = input;
        const { models } = ctx;

        const card = await models.Deals.getDeal(contentTypeId);
        const stage = await models.Stages.getStage(card.stageId);
        const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

        notifDoc.notifType = `${type}Delete`;
        notifDoc.content = `"${card.name}"`;
        notifDoc.link = `/${type}/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}&itemId=${card._id}`;
        notifDoc.contentTypeId = card._id;
        notifDoc.contentType = `${type}`;
        notifDoc.item = card;

        // sendNotificationOfItems on and deal
        notifDoc.notifOfItems = true;

        return notifDoc;
      }),

    notifiedUserIds: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { item } = input;
        const { models } = ctx;

        let userIds: string[] = [];

        userIds = userIds.concat(item.assignedUserIds || []);

        userIds = userIds.concat(item.watchedUserIds || []);

        const stage = await models.Stages.getStage(item.stageId);
        const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

        userIds = userIds.concat(pipeline.watchedUserIds || []);

        return userIds;
      }),

    tag: salesProcedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { action, _ids, tagIds, targetIds } = input;
      const { models } = ctx;

      let response = {};

      if (action === 'count') {
        response = await models.Deals.countDocuments({ tagIds: { $in: _ids } });
      }

      if (action === 'tagObject') {
        const before = await models.Deals.find({
          _id: { $in: targetIds },
        }).lean();
        await assertDealUpdatesAllowed(models, before, { $set: { tagIds } });
        await models.Deals.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } },
        );

        response = await models.Deals.find({ _id: { $in: targetIds } }).lean();
      }

      return response;
    }),

    getFilterParams: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { filter, userId } = input;
        const { models, subdomain } = ctx;
        return await generateFilter(models, subdomain, userId, filter);
      }),

    generateAmounts: t.procedure.input(z.any()).query(async ({ input }) => {
      return generateAmounts(input);
    }),

    generateProducts: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { subdomain } = ctx;
        return await generateProducts(subdomain, input);
      }),

    replaceContent: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { replacerIds, content } = input || {};

      return await replaceDealContent({
        models,
        subdomain,
        replacerIds: replacerIds || [],
        content,
      });
    }),

    createCommentActivityLog: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { eventHandlers } = ctx;
        const { dealId, commentId, createdBy, userId, commentContent } = input;

        if (!dealId || !commentId || !createdBy) {
          throw new Error(
            'Missing required parameters: dealId, commentId, createdBy',
          );
        }
        try {
          const salesEventHandlers = eventHandlers('sales');
          const { createActivityLog } = salesEventHandlers('sales', 'deals');

          createActivityLog(
            {
              activityType: 'comment',
              target: {
                _id: dealId,
                moduleName: 'sales',
                collectionName: 'deals',
              },
              action: {
                type: 'comment',
                description: `Comment added from client portal ${commentContent}`,
              },
              changes: {
                commentId,
                commentedAt: new Date(),
              },
              metadata: {
                dealId,
                commentId,
                createdBy,
              },
            },
            userId || createdBy || '',
          );

          return { dealId, commentId };
        } catch (error: any) {
          throw new Error(error?.message || 'Failed to create activity log');
        }
      }),

    add: t.procedure
      .input(
        z.object({
          name: agentShortText,
          stageId: agentRecordId,
          description: agentDescriptionText.optional(),
          startDate: agentIsoDate.optional(),
          closeDate: agentIsoDate.optional(),
          assignedUserIds: agentIdList.optional(),
          customerId: agentRecordId.optional(),
          companyId: agentRecordId.optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const user = await requireAgentUser(ctx);

        const stage = await models.Stages.findOne({
          _id: input.stageId,
        }).lean();
        if (!stage) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Stage not found',
          });
        }

        const doc: IDeal = {
          name: input.name,
          stageId: input.stageId,
        };
        if (input.description !== undefined) {
          doc.description = input.description;
        }
        if (input.startDate !== undefined) {
          doc.startDate = new Date(input.startDate);
        }
        if (input.closeDate !== undefined) {
          doc.closeDate = new Date(input.closeDate);
        }
        if (input.assignedUserIds !== undefined) {
          doc.assignedUserIds = input.assignedUserIds;
        }
        if (input.customerId !== undefined) {
          doc.customerId = input.customerId;
        }
        if (input.companyId !== undefined) {
          doc.companyId = input.companyId;
        }

        return addDeal({
          models,
          subdomain,
          user,
          doc: doc as IDeal & { processId: string; aboveItemId: string },
        });
      }),

    edit: t.procedure
      .input(
        z.object({
          _id: agentRecordId,
          name: agentShortText.optional(),
          description: agentDescriptionText.optional(),
          startDate: agentIsoDate.optional(),
          closeDate: agentIsoDate.optional(),
          assignedUserIds: agentIdList.optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        const { _id, ...fields } = input;

        const doc: Partial<IDeal> = {};
        if (fields.name !== undefined) {
          doc.name = fields.name;
        }
        if (fields.description !== undefined) {
          doc.description = fields.description;
        }
        if (fields.startDate !== undefined) {
          doc.startDate = new Date(fields.startDate);
        }
        if (fields.closeDate !== undefined) {
          doc.closeDate = new Date(fields.closeDate);
        }
        if (fields.assignedUserIds !== undefined) {
          doc.assignedUserIds = fields.assignedUserIds;
        }

        if (!Object.keys(doc).length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Provide at least one field to update',
          });
        }

        const deal = await models.Deals.findOne({ _id }).lean();
        if (!deal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Deal not found',
          });
        }

        const user = await requireAgentUser(ctx);

        return editDeal({
          models,
          subdomain,
          _id,
          processId: ctx.processId ?? '',
          doc: doc as IDeal,
          user,
        });
      }),

    move: t.procedure
      .input(
        z.object({
          _id: agentRecordId,
          stageId: agentRecordId,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const user = await requireAgentUser(ctx);

        const { _id, stageId } = input;

        const deal = await models.Deals.findOne({ _id }).lean();
        if (!deal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Deal not found',
          });
        }

        const stage = await models.Stages.findOne({ _id: stageId }).lean();
        if (!stage) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Stage not found',
          });
        }

        return changeDeal(subdomain, models, user._id, {
          itemId: _id,
          destinationStageId: stageId,
          sourceStageId: deal.stageId,
          processId: ctx.processId,
        });
      }),

    subscriptionWrapper: publishDealSubscription,
    // those create and update procedures are for system user, because of user missing
    create: createDealProcedure,
    updateOne: updateDealProcedure,
  },

  stage: {
    findOne: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { subdomain, ...rest } = input;
        return await models.Stages.findOne(rest).lean();
      }),
    find: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { subdomain, ...rest } = input;
        return await models.Stages.find(rest).sort({ order: 1 }).lean();
      }),
  },
  pipeline: {
    findOne: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { stageId, ...rest } = input || {};
        const { query, fields } = rest || {};

        let pipeline =
          query && Object.keys(query).length
            ? await models.Pipelines.findOne(query, fields).lean()
            : null;

        if (!pipeline && stageId) {
          const stage = await models.Stages.findOne({ _id: stageId }).lean();
          if (stage) {
            pipeline = await models.Pipelines.findOne(
              { _id: stage.pipelineId },
              fields,
            ).lean();
          }
        }

        return pipeline || {};
      }),
  },
});
