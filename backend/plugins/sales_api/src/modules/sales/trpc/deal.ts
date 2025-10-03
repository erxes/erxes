import { initTRPC } from '@trpc/server';
import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { addDeal, editDeal } from '~/modules/sales/graphql/resolvers/mutations/utils';
import { generateFilter } from '~/modules/sales/graphql/resolvers/queries/deals';
import { convertNestedDate } from '~/modules/sales/utils';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const dealTrpcRouter = t.router({
  // t.procedure.input(z.any()).mutation(async ({ctx, input}) => {}),
  // t.procedure.input(z.any()).query(async ({ctx, input}) => {}),
  deal: {
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return {
        status: "success",
        data: await models.Deals.findOne(input).lean()
      };
    }),

    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      const { query, skip, limit, sort = {} } = input;

      if (!query) {
        return {
          status: "success",
          data: await models.Deals.find(input).lean()
        };
      }


      return {
        status: "success",
        data: await models.Deals.find(query)
          .skip(skip || 0)
          .limit(limit || 0)
          .sort(sort)
          .lean()
      };
    }),

    aggregate: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return {
        status: "success",
        data: await models.Deals.aggregate(convertNestedDate(input))
      };
    }),

    count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return {
        status: "success",
        data: await models.Deals.find(input).countDocuments()
      };
    }),

    getLink: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _id } = input;
      const item = await models.Deals.findOne({ _id });

      if (!item) {
        return {
          status: "error",
          errorMessage: "Deal not found"
        };
      }

      const stage = await models.Stages.getStage(item.stageId);
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
      const board = await models.Boards.getBoard(pipeline.boardId);

      return {
        status: "success",
        data: `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${_id}`
      };
    }),

    findDealProductIds: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { _ids } = input;

      const dealProductIds = await await models.Deals.find({
        "productsData.productId": { $in: _ids }
      }).distinct("productsData.productId");

      return { data: dealProductIds, status: "success" };
    }),

    createItem: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
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
          data: await addDeal({ models, user, doc })
        }
      } catch (e) {
        return {
          status: 'error',
          errorMessage: e.message,
        };
      }
    }),

    editItem: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;

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
          data: await editDeal({ models, _id: itemId, doc, processId, user }),
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
        status: "success",
        data: await models.Deals.removeDeals(_ids)
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
        const { models } = ctx;
        return await generateFilter(models, userId, filter);
      }),
  },
});

export const fetchSegment = async (
  segmentId: string,
  options?,
  segmentData?: any,
) => {
  return await sendTRPCMessage({
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
