import { initTRPC } from '@trpc/server';
import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  addDeal,
  editDeal,
} from '~/modules/sales/graphql/resolvers/mutations/utils';
import { generateFilter } from '~/modules/sales/graphql/resolvers/queries/deals';
import {
  convertNestedDate,
  generateAmounts,
  generateProducts,
} from '~/modules/sales/utils';
import { createEventDispatcher } from 'erxes-api-shared/core-modules';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const dealTrpcRouter = t.router({
  deal: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: 'success',
        data: await models.Deals.findOne(input).lean(),
      };
    }),

    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      const { query, skip, limit, sort = {} } = input;

      if (!query) {
        return {
          status: 'success',
          data: await models.Deals.find(input).lean(),
        };
      }

      return {
        status: 'success',
        data: await models.Deals.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean(),
      };
    }),

    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return {
        status: 'success',
        data: await models.Deals.aggregate(convertNestedDate(input)),
      };
    }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return {
        status: 'success',
        data: await models.Deals.find(input).countDocuments(),
      };
    }),

    getLink: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;
      const item = await models.Deals.findOne({ _id });

      if (!item) {
        return {
          status: 'error',
          errorMessage: 'Deal not found',
        };
      }

      const stage = await models.Stages.getStage(item.stageId);
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
      const board = await models.Boards.getBoard(pipeline.boardId);

      return {
        status: 'success',
        data: `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${_id}`,
      };
    }),

    findDealProductIds: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const { _ids } = input;

        const dealProductIds = await await models.Deals.find({
          'productsData.productId': { $in: _ids },
        }).distinct('productsData.productId');

        return { data: dealProductIds, status: 'success' };
      }),

    createItem: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { user, processId, ...doc } = input;
      if (!user || !processId) {
        return {
          status: 'error',
          errorMessage: 'you must provide some params',
        };
      }
      try {
        return {
          status: 'success',
          data: await addDeal({ models, subdomain, user, doc }),
        };
      } catch (e) {
        return {
          status: 'error',
          errorMessage: e.message,
        };
      }
    }),

    editItem: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;

      const { itemId, processId, user, ...doc } = input;

      if (!itemId || !user || !processId) {
        return {
          status: 'error',
          errorMessage: 'you must provide some params',
        };
      }

      try {
        return {
          status: 'success',
          data: await editDeal({
            models,
            subdomain,
            _id: itemId,
            doc,
            processId,
            user,
          }),
        };
      } catch (e) {
        return {
          status: 'error',
          errorMessage: e.message,
        };
      }
    }),

    removeItem: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _ids } = input;

      return {
        status: 'success',
        data: await models.Deals.removeDeals(_ids),
      };
    }),

    contentIds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { pipelineId } = input;
      const { models } = ctx;

      const stageIds = await models.Stages.find({ pipelineId }).distinct('_id');

      return models.Deals.find({ stageId: { $in: stageIds } }).distinct('_id');
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

    tag: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { action, _ids, tagIds, targetIds } = input;
      const { models } = ctx;

      let response = {};

      if (action === 'count') {
        response = await models.Deals.countDocuments({ tagIds: { $in: _ids } });
      }

      if (action === 'tagObject') {
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

    createCommentActivityLog: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { subdomain } = ctx;
        const {
          dealId,
          commentId,
          createdBy,
          processId,
          userId,
          commentContent,
        } = input;

        if (!dealId || !commentId || !createdBy) {
          return {
            status: 'error',
            errorMessage:
              'Missing required parameters: dealId, commentId, createdBy',
          };
        }

        try {
          const dispatcher = createEventDispatcher({
            subdomain,
            pluginName: 'sales',
            moduleName: 'sales',
            collectionName: 'deals',
            getContext: () => ({
              subdomain,
              processId: processId || '',
              userId: userId || createdBy || '',
            }),
          });

          dispatcher.createActivityLog({
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
          });

          return {
            status: 'success',
            data: { dealId, commentId },
          };
        } catch (error: any) {
          return {
            status: 'error',
            errorMessage: error?.message || 'Failed to create activity log',
          };
        }
      }),
  },
  stage: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { subdomain, ...rest } = input;
      return {
        status: 'success',
        data: await models.Stages.findOne(rest).lean(),
      };
    }),
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { subdomain, ...rest } = input;
      return {
        status: 'success',
        data: await models.Stages.find(rest).sort({ order: 1 }).lean(),
      };
    }),
  },
  pipeline: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { subdomain, stageId, ...rest } = input;

      let pipeline = await models.Pipelines.findOne(rest);

      if (!pipeline && stageId) {
        const stage = await models.Stages.findOne({ _id: stageId }).lean();
        if (stage) {
          pipeline = await models.Pipelines.findOne({ _id: stage.pipelineId });
        }
      }

      return pipeline;
    }),
  },
});

export const fetchSegment = async (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any,
) => {
  return await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'segments',
    action: 'fetchSegment',
    input: {
      segmentId,
      options,
      segmentData,
    },
    defaultValue: [],
  });
};
