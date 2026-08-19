import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const tagTrpcRouter = t.router({
  tags: t.router({
    find: t.procedure
      .meta({
        agent: {
          description:
            'List tags: { query? }. Tags are scoped per entity type — filter with { type: "core:customer" } for customer tags, "core:company" for companies, "core:product" for products. Use to resolve tag names to _ids before tagging records via customers.tag or setting tagIds in create/update docs.',
          permission: { module: 'tags', action: 'tagsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Tags.find(query).lean();
    }),

    findOne: t.procedure
      .meta({
        agent: {
          description:
            'Get a single tag by { _id }, { name, type }, or any MongoDB-style query. Returns {} when nothing matches.',
          permission: { module: 'tags', action: 'tagsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const query = input?.query || input?.selector || input;
      const { models } = ctx;

      if (!query || !Object.keys(query).length) {
        return {};
      }

      return await models.Tags.findOne(query);
    }),

    findWithChild: t.procedure
      .meta({
        agent: {
          description:
            'Get tags matching { query?, fields? } plus all their child tags (tags nest via parentId). Use when a tagging or filtering operation should include sub-tags.',
          permission: { module: 'tags', action: 'tagsRead' },
        },
      })
      .input(z.any())
      .query(async ({ ctx, input }) => {
      const { query, fields } = input;
      const { models } = ctx;

      const tags = await models.Tags.find(query).lean();

      if (!tags.length) {
        return [];
      }

      const orderQry: any[] = [];
      for (const tag of tags) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(tag.order || '')}`) },
        });
      }

      return await models.Tags.find(
        {
          $or: orderQry,
        },
        fields || {},
      )
        .sort({ order: 1 })
        .lean();
    }),
    create: t.procedure
      .meta({
        agent: {
          description:
            'Create a tag. Input: { data: { name, type, colorCode?, parentId? } } — type scopes the tag, e.g. "core:customer", "core:company", "core:product". Check for an existing tag with tags.find (by name + type) before creating a duplicate. Then attach it with customers.tag or doc.tagIds.',
          permission: { module: 'tags', action: 'tagsCreate' },
        },
      })
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
      const { data } = input;
      const { models } = ctx;

      return await models.Tags.createTag(data);
    }),
  }),
});
