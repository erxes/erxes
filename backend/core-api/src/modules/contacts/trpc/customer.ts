import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { createOrUpdate } from '../utils';

const t = initTRPC.context<CoreTRPCContext>().create();

export const customerRouter = t.router({
  customers: t.router({
    find: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return models.Customers.find(query).lean();
      }),

    findOne: t.procedure
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

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
      .input(z.object({ query: z.any() }))
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;

        return models.Customers.countDocuments(query);
      }),

    createCustomer: t.procedure
      .input(z.object({ doc: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { doc } = input;
        const { models } = ctx;

        return models.Customers.createCustomer(doc);
      }),

    updateCustomer: t.procedure
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

    tag: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
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
