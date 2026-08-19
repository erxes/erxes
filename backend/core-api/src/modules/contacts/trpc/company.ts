import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createOrUpdate } from '../utils';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const companyTrpcRouter = t.router({
  companies: t.router({
    find: t.procedure
      .meta({
        agent: {
          description:
            'Search companies with a MongoDB-style filter: { query: {...} }, e.g. { query: { primaryName: "Acme" } } or { query: { industry: "Technology" } }. Returns full company documents. Use companies.findOne when you already know a unique key.',
          permission: { module: 'contacts', action: 'contactsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Companies.find(query).lean();
    }),

    findOne: t.procedure
      .meta({
        agent: {
          description:
            'Get a single company by a unique key: { _id }, { name } or { companyPrimaryName }, { email } or { companyPrimaryEmail }, { phone } or { companyPrimaryPhone }, or { companyCode }. Deleted companies are excluded automatically. Returns {} when nothing matches. Call this before companies.updateCompany.',
          permission: { module: 'contacts', action: 'contactsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

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
      .meta({
        agent: {
          description:
            'List active (non-deleted) companies with optional projection and pagination: { query, fields, skip, limit }. Prefer companies.find unless you need field projection or pagination.',
          permission: { module: 'contacts', action: 'contactsRead' },
        },
      })
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
      .meta({
        agent: {
          description:
            'Create a company. Input: { doc: { primaryName?, names?, primaryEmail?, emails?, primaryPhone?, phones?, website?, industry?, size?, code?, tagIds?, customFieldsData?, ... } }. Check for duplicates first with companies.findOne by name or email. For custom fields, discover field IDs via fields.fieldsCombinedByContentType (contentType "core:contacts.companies") and format values with fields.prepareCustomFieldsData.',
          permission: { module: 'contacts', action: 'contactsCreate' },
        },
      })
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        const company = await models.Companies.createCompany(doc);

        return company;
      }),

    updateCompany: t.procedure
      .meta({
        agent: {
          description:
            'Update a company by ID. Input: { _id, doc: { ...fields to change } } — only provided fields are modified. Call companies.findOne first to get the _id and current values.',
          permission: { module: 'contacts', action: 'contactsUpdate' },
        },
      })
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
        if (!selector || !Object.keys(selector).length) {
          return {};
        }
        return await models.Companies.updateMany(selector, modifier);
      }),
  }),
});
