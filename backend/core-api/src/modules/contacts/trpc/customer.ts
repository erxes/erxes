import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { agentMeta } from '~/utils/agentMeta';
import { createOrUpdate } from '../utils';

const t = initTRPC.context<CoreTRPCContext>().create();

export const customerRouter = t.router({
  customers: t.router({
    find: t.procedure
      .meta(
        agentMeta(
          'Search customers (people) with a MongoDB-style filter. Input: { query: {...} }, e.g. { query: { primaryEmail: "a@b.com" } } or { query: { tagIds: ["tagId"] } }. Returns full customer documents. Use customers.findOne when you already know a unique key, and customers.count when you only need the total number.',
          { module: 'contacts', action: 'contactsRead' },
        ),
      )
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return models.Customers.find(query).lean();
      }),

    findOne: t.procedure
      .meta(
        agentMeta(
          'Get a single customer by a unique key: { _id }, { customerPrimaryEmail }, { customerPrimaryPhone }, or { customerCode }. Deleted customers are excluded automatically. Returns {} when nothing matches. Always call this before customers.updateCustomer to confirm the record and read its current values.',
          { module: 'contacts', action: 'contactsRead' },
        ),
      )
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      const defaultFilter = { status: { $ne: 'deleted' } };

      if (query?.customerPrimaryEmail) {
        defaultFilter['$or'] = [
          { emails: { $in: [query.customerPrimaryEmail] } },
          { primaryEmail: query.customerPrimaryEmail },
        ];
      }

      if (query?.customerPrimaryPhone) {
        defaultFilter['$or'] = [
          { phones: { $in: [query.customerPrimaryPhone] } },
          { primaryPhone: query.customerPrimaryPhone },
        ];
      }

      if (query?.customerCode) {
        defaultFilter['code'] = query.customerCode;
      }

      if (query?._id) {
        defaultFilter['_id'] = query._id;
      }
      return models.Customers.findOne(defaultFilter).lean();
    }),

    findActiveCustomers: t.procedure
      .meta(
        agentMeta(
          'List active (non-deleted) customers with optional projection and pagination: { query, fields, skip, limit }, e.g. fields: { primaryEmail: 1, firstName: 1 } to return only those columns. Prefer customers.find unless you need field projection or pagination.',
          { module: 'contacts', action: 'contactsRead' },
        ),
      )
      .input(
        z.object({
          query: z.any(),
          fields: z.any(),
          skip: z.any(),
          limit: z.any(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { query, fields, skip, limit } = input;
        const { models } = ctx;

        return models.Customers.findActiveCustomers(query, fields, skip, limit);
      }),

    getCustomerName: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { customer } = input;
        const { models } = ctx;

        return models.Customers.getCustomerName(customer);
      }),

    getWidgetCustomer: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Customers.getWidgetCustomer(input);
      }),

    count: t.procedure
      .meta(
        agentMeta(
          'Count customers matching a MongoDB-style filter: { query: {...} }. Use this for "how many customers ..." questions instead of fetching full records.',
          { module: 'contacts', action: 'contactsRead' },
        ),
      )
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return models.Customers.countDocuments(query);
      }),

    createCustomer: t.procedure
      .meta(
        agentMeta(
          'Create a customer (person). Input: { doc: { firstName?, lastName?, primaryEmail?, emails?, primaryPhone?, phones?, code?, tagIds?, customFieldsData?, ... } }. Workflow: (1) check for duplicates with customers.findOne by email or phone; (2) resolve tag IDs with tags.find (type "core:customer"); (3) for custom fields, discover field IDs via fields.fieldsCombinedByContentType (contentType "core:contacts.customers") and format values with fields.prepareCustomFieldsData.',
          { module: 'contacts', action: 'contactsCreate' },
        ),
      )
      .input(z.object({ doc: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        return models.Customers.createCustomer(doc);
      }),

    updateCustomer: t.procedure
      .meta(
        agentMeta(
          'Update a customer by ID. Input: { _id, doc: { ...fields to change } } — only provided fields are modified. Call customers.findOne first to get the _id and current values. For custom fields, build doc.customFieldsData with fields.prepareCustomFieldsData.',
          { module: 'contacts', action: 'contactsUpdate' },
        ),
      )
      .input(z.object({ _id: z.string(), doc: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { _id, doc } = input;
        const { models } = ctx;
        return models.Customers.updateCustomer(_id, doc);
      }),

    updateOne: t.procedure
      .input(z.object({ query: z.any(), doc: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { query, doc } = input;
        const { models } = ctx;

        if (!query || !Object.keys(query).length) {
          return {};
        }

        return models.Customers.updateOne(query, doc);
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
        return await models.Customers.updateMany(selector, modifier);
      }),

    removeCustomers: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _ids } = input;
        const { models } = ctx;

        return models.Customers.removeCustomers(_ids);
      }),

    markCustomerAsActive: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id } = input;
        const { models } = ctx;

        return models.Customers.markCustomerAsActive(_id);
      }),

    createMessengerCustomer: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc, customData } = input;
        const { models } = ctx;

        return models.Customers.createMessengerCustomer({
          doc,
          customData,
        });
      }),

    updateMessengerCustomer: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id, doc, customData } = input;
        const { models } = ctx;

        return models.Customers.updateMessengerCustomer({
          _id,
          doc,
          customData,
        });
      }),

    saveVisitorContactInfo: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { params } = input;
        const { models } = ctx;

        return models.Customers.saveVisitorContactInfo(params);
      }),

    updateLocation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { customerId, browserInfo } = input;
        const { models } = ctx;

        return models.Customers.updateLocation(customerId, browserInfo);
      }),

    updateSession: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { customerId } = input;
        const { models } = ctx;

        return models.Customers.updateSession(customerId);
      }),

    setUnsubscribed: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { customerIds = [], status, _id } = input;
        const { models } = ctx;

        return models.Customers.updateSubscriptionStatus({
          customerIds,
          status,
          _id,
        });
      }),

    createOrUpdate: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        return createOrUpdate({
          collection: models.Customers,
          data: doc,
        });
      }),

    tag: t.procedure
      .meta(
        agentMeta(
          'Attach tags to customers, or count tagged customers. Input: { action, _ids, tagIds, targetIds }. action "tagObject" sets tagIds on the customers listed in targetIds; action "count" counts customers carrying the tag IDs in _ids. Resolve tag IDs first with tags.find (type "core:customer").',
          { module: 'tags', action: 'tagsTag' },
        ),
      )
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
      const { action, _ids, tagIds, targetIds } = input;
      const { models } = ctx;

      let response = {};

      if (action === 'count') {
        response = await models.Customers.countDocuments({
          tagIds: { $in: _ids },
        });
      }

      if (action === 'tagObject') {
        await models.Customers.updateMany(
          { _id: { $in: targetIds } },
          { $set: { tagIds } },
        );

        response = await models.Customers.find({
          _id: { $in: targetIds },
        }).lean();
      }

      return response;
    }),
  }),
});
