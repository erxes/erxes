import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

const cpUserListFilterSchema = z.object({
  erxesCustomerId: z.string().optional(),
  clientPortalId: z.string().optional(),
  type: z.enum(['customer', 'company']).optional(),
  isVerified: z.boolean().optional(),
  searchValue: z.string().optional(),
  limit: z.number().min(1).max(1000).default(50),
  skip: z.number().min(0).default(0),
});

export const cpUsersTrpcRouter = t.router({
  cpUsers: t.router({
    list: t.procedure
      .meta({
        agent: {
          description:
            'List client portal users (end customers with portal accounts): { erxesCustomerId?, clientPortalId?, type?, isVerified?, searchValue?, limit?, skip? }. Pass erxesCustomerId (from customers.findOne) to find the portal account linked to a customer. Returns { list, totalCount }.',
          permission: { module: 'clientPortal', action: 'clientPortalRead' },
        },
      })
      .input(cpUserListFilterSchema)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const query: Record<string, unknown> = {};

        if (input.erxesCustomerId) {
          query.erxesCustomerId = input.erxesCustomerId;
        }
        if (input.clientPortalId) {
          query.clientPortalId = input.clientPortalId;
        }
        if (input.type) {
          query.type = input.type;
        }
        if (typeof input.isVerified === 'boolean') {
          query.isVerified = input.isVerified;
        }
        if (input.searchValue?.trim()) {
          const regex = new RegExp(
            `.*${escapeRegExp(input.searchValue.trim())}.*`,
            'i',
          );
          query.$or = [
            { email: regex },
            { phone: regex },
            { firstName: regex },
            { lastName: regex },
          ];
        }

        const limit = input.limit ?? 50;
        const skip = input.skip ?? 0;

        const list = await models.CPUser.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .lean();
        const totalCount = await models.CPUser.countDocuments(query);

        return { list, totalCount };
      }),
    get: t.procedure
      .meta({
        agent: {
          description:
            'Get one client portal user by { id } or by { erxesCustomerId, clientPortalId? }. Returns null when not found. Use cpUsers.list to search by name/email/phone instead.',
          permission: { module: 'clientPortal', action: 'clientPortalRead' },
        },
      })
      .input(
        z.object({
          id: z.string().optional(),
          erxesCustomerId: z.string().optional(),
          clientPortalId: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        if (input.id) {
          return models.CPUser.findOne({ _id: input.id }).lean();
        }
        if (input.erxesCustomerId) {
          const query: Record<string, string> = {
            erxesCustomerId: input.erxesCustomerId,
          };
          if (input.clientPortalId) {
            query.clientPortalId = input.clientPortalId;
          }
          return models.CPUser.findOne(query).lean();
        }
        return null;
      }),
  }),
  clientPortals: t.router({
    get: t.procedure
      .meta({
        agent: {
          description:
            'Get a client portal configuration by { _id }. Returns portal settings (name, domain, features). The portal _id is needed for cpUsers.list and cpNotifications.create.',
          permission: { module: 'clientPortal', action: 'clientPortalRead' },
        },
      })
      .input(z.object({ _id: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.ClientPortal.findOne({ _id: input._id }).lean();
      }),
  }),
});
