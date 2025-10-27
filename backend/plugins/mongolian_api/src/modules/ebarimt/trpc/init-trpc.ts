import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { ITRPCContext } from '../../../../../../erxes-api-shared/src/utils';

import { generateModels } from "../connectionResolver";
import { afterMutationHandlers } from "../afterMutations";
import { beforeResolverHandlers } from "../beforeResolvers";
import { getCompanyInfo, getConfig } from "../utils";

// --- Initialize TRPC with context type ---
const t = initTRPC.context<ITRPCContext>().create();

// --- ebarimt.afterMutation (formerly consumeQueue) ---
const ebarimtAfterMutation = t.procedure
  .input(z.object({ data: z.any() }))
  .mutation(async ({ input }) => {
    const models = await generateModels();
    await afterMutationHandlers(models, input.data);
    return { status: "success" };
  });

// --- ebarimt.beforeResolver (formerly consumeRPCQueue) ---
const ebarimtBeforeResolver = t.procedure
  .input(z.object({ data: z.any() }))
  .query(async ({ input }) => {
    const data = await beforeResolverHandlers(input.data);
    return { status: "success", data };
  });

// --- ebarimt.putresponses router ---
const ebarimtPutResponses = t.router({
  find: t.procedure
    .input(
      z.object({
        query: z.record(z.any()),
        sort: z.record(z.any()).optional(),
      })
    )
    .query(async ({ input }) => {
      const models = await generateModels();
      const data = await (models.PutResponses as any)
        .find(input.query)
        .sort(input.sort || {})
        .lean();
      return { status: "success", data };
    }),

  putDatas: t.procedure
    .input(
      z.object({
        contentType: z.string(),
        contentId: z.string(),
        orderInfo: z.record(z.any()),
        config: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const models = await generateModels();
      const mainConfig = { ...(await getConfig("EBARIMT", {})), ...input.config };
      const data = await (models.PutResponses as any).putData(
        {
          ...input.orderInfo,
          contentType: input.contentType,
          contentId: input.contentId,
        },
        mainConfig
      );
      return { status: "success", data };
    }),

  returnBill: t.procedure
    .input(
      z.object({
        contentType: z.string(),
        contentId: z.string(),
        number: z.string(),
        config: z.record(z.any()).optional(),
        user: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const models = await generateModels();
      const mainConfig = { ...(await getConfig("EBARIMT", {})), ...input.config };
      const data = await (models.PutResponses as any).returnBill(
        {
          contentType: input.contentType,
          contentId: input.contentId,
          number: input.number,
        },
        mainConfig,
        input.user
      );
      return { status: "success", data };
    }),

  createOrUpdate: t.procedure
    .input(
      z.object({
        _id: z.string(),
        doc: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const models = await generateModels();
      const data = await (models.PutResponses as any).updateOne(
        { _id: input._id },
        { $set: { ...input.doc } },
        { upsert: true }
      );
      return { status: "success", data };
    }),

  putHistory: t.procedure
    .input(
      z.object({
        contentType: z.string(),
        contentId: z.string(),
        taxType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const models = await generateModels();
      const data = await (models.PutResponses as any).putHistory({
        contentType: input.contentType,
        contentId: input.contentId,
      });
      return { status: "success", data };
    }),

  putHistories: t.procedure
    .input(
      z.object({
        contentType: z.string(),
        contentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const models = await generateModels();
      const data = await (models.PutResponses as any).putHistories({
        contentType: input.contentType,
        contentId: input.contentId,
      });
      return { status: "success", data };
    }),

  bulkWrite: t.procedure
    .input(
      z.object({
        bulkOps: z.array(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const models = await generateModels();
      await (models.PutResponses as any).bulkWrite(input.bulkOps);
      return { status: "success" };
    }),

  getCompany: t.procedure
    .input(
      z.object({
        companyRD: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = (await getConfig("EBARIMT", {})) || {};
      const response = await getCompanyInfo({
        checkTaxpayerUrl: config.checkTaxpayerUrl,
        no: input.companyRD,
      });
      return { status: "success", data: response.result?.data };
    }),
});

// --- productRules router ---
const productRules = t.router({
  find: t.procedure
    .input(z.object({ data: z.record(z.any()) }))
    .query(async ({ input }) => {
      const models = await generateModels();
      const data = await (models.ProductRules as any).find(input.data).lean();
      return { status: "success", data };
    }),
});

// --- Root router ---
export const appRouter = t.router({
  ebarimt: t.router({
    afterMutation: ebarimtAfterMutation,
    beforeResolver: ebarimtBeforeResolver,
    putresponses: ebarimtPutResponses,
    productRules,
  }),
});

export type AppRouter = typeof appRouter;
