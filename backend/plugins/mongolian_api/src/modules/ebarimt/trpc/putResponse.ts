import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { getCompanyInfo, getConfig } from '../utils';

export type EbarimtTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<EbarimtTRPCContext>().create();

export const putResponsesTrpcRouter = t.router({
  putResponses: {
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const { query, sort } = input;
      return await models.PutResponses.find(query)
        .sort(sort || {})
        .lean();
    }),

    putDatas: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { contentType, contentId, orderInfo, config } = input;

      return await models.PutResponses.putData(
        {
          ...orderInfo,
          contentType,
          contentId,
        },
        { ...(await getConfig(subdomain, 'EBARIMT', {})), ...config },
      );
    }),

    returnBill: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { contentType, contentId, number, config, user } = input;

      const mainConfig = {
        ...(await getConfig(subdomain, 'EBARIMT', {})),
        ...config,
      };

      return await models.PutResponses.returnBill(
        { contentType, contentId, number },
        mainConfig,
        user,
      );
    }),

    createOrUpdate: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { _id, doc } = input;

        return await models.PutResponses.updateOne(
          { _id },
          { $set: { ...doc } },
          { upsert: true },
        );
      }),

    putHistory: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { contentType, contentId } = input;
      return await models.PutResponses.putHistory({ contentType, contentId });
    }),

    putHistories: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { contentType, contentId } = input;
        return await models.PutResponses.putHistories({
          contentType,
          contentId,
        });
      }),

    bulkWrite: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { bulkOps } = input;
      return await models.PutResponses.bulkWrite(bulkOps);
    }),

    getCompany: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      const { companyRD } = input;

      const config = (await getConfig(subdomain, 'EBARIMT', {})) || {};
      const response = await getCompanyInfo({
        checkTaxpayerUrl: config.checkTaxpayerUrl,
        no: companyRD,
      });

      return response.result?.data;
    }),
  },
}) as ReturnType<typeof t.router>;
