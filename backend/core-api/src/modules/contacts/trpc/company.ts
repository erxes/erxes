import { initTRPC } from '@trpc/server';
import { generateModels } from '~/connectionResolvers';
import { z } from 'zod';
import { createOrUpdate } from '../utils';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const companyTrpcRouter = t.router({
  companies: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Companies.find(query).lean();
    }),

    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      const defaultFilter = { status: { $ne: 'deleted' } };

      if (query.companyPrimaryName) {
        defaultFilter['$or'] = [
          { names: { $in: [query.companyPrimaryName] } },
          { primaryName: query.companyPrimaryName },
        ];
      }

      if (query.name) {
        defaultFilter['$or'] = [
          { names: { $in: [query.name] } },
          { primaryName: query.name },
        ];
      }

      if (query.email) {
        defaultFilter['$or'] = [
          { emails: { $in: [query.email] } },
          { primaryEmail: query.email },
        ];
      }

      if (query.phone) {
        defaultFilter['$or'] = [
          { phones: { $in: [query.phone] } },
          { primaryPhone: query.phone },
        ];
      }

      if (query.companyPrimaryEmail) {
        defaultFilter['$or'] = [
          { emails: { $in: [query.companyPrimaryEmail] } },
          { primaryEmail: query.companyPrimaryEmail },
        ];
      }

      if (query.companyPrimaryPhone) {
        defaultFilter['$or'] = [
          { phones: { $in: [query.companyPrimaryPhone] } },
          { primaryPhone: query.companyPrimaryPhone },
        ];
      }

      if (query.companyCode) {
        defaultFilter['code'] = query.companyCode;
      }

      if (query._id) {
        defaultFilter['_id'] = query._id;
      }

      return models.Companies.findOne(defaultFilter).lean();
    }),

    findActiveCompanies: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query, fields, skip, limit } = input;
        const { models } = ctx;

        return models.Companies.findActiveCompanies(query, fields, skip, limit);
      }),

    getCompanyName: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { company } = input;
      const { models } = ctx;

      return models.Companies.getCompanyName(company);
    }),

    createCompany: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        const company = await models.Companies.createCompany(doc);

        return company;
      }),

    updateCompany: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id, doc } = input;
        const { models } = ctx;

        const company = await models.Companies.updateCompany(_id, doc);

        return company;
      }),

    removeCompanies: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _ids } = input;
        const { models } = ctx;

        return models.Companies.removeCompanies(_ids);
      }),

    createOrUpdate: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        return createOrUpdate({
          collection: models.Companies,
          data: doc,
        });
      }),
    updateMany: t.procedure
      .input(
        z.object({
          selector: z.record(z.any()),
          modifier: z.record(z.any()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { selector, modifier } = input;
        return await models.Companies.updateMany(selector, modifier);
      }),
  }),
});
