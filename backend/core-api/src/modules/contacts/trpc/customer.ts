import { initTRPC, TRPCError } from '@trpc/server';
import { ICustomer } from 'erxes-api-shared/core-types';
import { z } from 'zod';
import { syncCustomerContactToCPUsers } from '@/clientportal/services/user/contactService';
import { IModels } from '~/connectionResolvers';
import { CoreTRPCContext } from '~/init-trpc';
import { createOrUpdate } from '../utils';

const t = initTRPC.context<CoreTRPCContext>().create();

const agentRecordId = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const agentShortText = z.string().trim().min(1).max(200);
const agentDescriptionText = z.string().trim().max(5000);

const customerWriteFields = {
  firstName: agentShortText.optional(),
  lastName: agentShortText.optional(),
  middleName: agentShortText.optional(),
  primaryEmail: z.string().trim().email().max(254).optional(),
  primaryPhone: z.string().trim().min(3).max(32).optional(),
  code: agentShortText.optional(),
  position: agentShortText.optional(),
  department: agentShortText.optional(),
  description: agentDescriptionText.optional(),
  state: z.enum(['lead', 'customer']).optional(),
  ownerId: agentRecordId.optional(),
};

// Every agent write runs as the user whose chat session issued it; the
// HMAC-signed context carries that user's id.
const requireAgentUser = async (ctx: {
  models: IModels;
  userId?: string;
}) => {
  const user = ctx.userId
    ? await ctx.models.Users.findOne({ _id: ctx.userId }).lean()
    : null;

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Acting user not found',
    });
  }

  return user;
};

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

    add: t.procedure
      .input(z.object(customerWriteFields))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const user = await requireAgentUser(ctx);

        const { firstName, lastName, primaryEmail, primaryPhone } = input;

        if (!firstName && !lastName && !primaryEmail && !primaryPhone) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Provide at least one of firstName, lastName, primaryEmail or primaryPhone',
          });
        }

        const doc: ICustomer = {};
        Object.assign(
          doc,
          Object.fromEntries(
            Object.entries(input).filter(([, value]) => value !== undefined),
          ),
        );

        if (primaryEmail) {
          doc.emails = [primaryEmail];
        }
        if (primaryPhone) {
          doc.phones = [primaryPhone];
        }

        return models.Customers.createCustomer(doc, user);
      }),

    edit: t.procedure
      .input(z.object({ _id: agentRecordId, ...customerWriteFields }))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        await requireAgentUser(ctx);

        const { _id, primaryEmail, primaryPhone, ...fields } = input;

        const providedEntries = Object.entries(fields).filter(
          ([, value]) => value !== undefined,
        );

        if (!providedEntries.length && !primaryEmail && !primaryPhone) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Provide at least one field to update',
          });
        }

        let existing;
        try {
          existing = await models.Customers.getCustomer(_id);
        } catch {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        const doc: ICustomer = {};
        Object.assign(doc, Object.fromEntries(providedEntries));

        if (primaryEmail) {
          doc.primaryEmail = primaryEmail;
          doc.emails = [
            ...new Set([...(existing.emails || []), primaryEmail]),
          ];
        }
        if (primaryPhone) {
          doc.primaryPhone = primaryPhone;
          doc.phones = [
            ...new Set([...(existing.phones || []), primaryPhone]),
          ];
        }

        const updated = await models.Customers.updateCustomer(_id, doc);

        await syncCustomerContactToCPUsers(models, _id, doc);

        return updated;
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
