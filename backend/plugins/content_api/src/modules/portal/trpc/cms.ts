import { initTRPC } from '@trpc/server';
import { cursorPaginate, ok } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { queryBuilder } from '~/modules/portal/graphql/resolvers/queries/post';
import { ContentTRPCContext } from '~/trpc/init-trpc';

const t = initTRPC.context<ContentTRPCContext>().create();

export const cmsRouter = t.router({
  /* ---------- PAGES ---------- */
  addPages: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    const { clientPortalId, kind, createdUserId } = input;

    const existing = await models.Pages.find({ clientPortalId }).lean();

    const exists = (slug: string) => existing.find((p) => p.slug === slug);

    const pushIfMissing = (slug: string) =>
      !exists(slug) &&
      bulk.push({
        createdUserId,
        clientPortalId,
        name: slug,
        slug,
        pageItems: [],
      });

    const bulk: any[] = [];
    const defaults = ['home', 'about', 'contact', 'privacy', 'terms'];
    defaults.forEach(pushIfMissing);

    if (kind === 'tour')
      [
        'tours',
        'tour',
        'checkout',
        'confirmation',
        'profile',
        'login',
        'register',
      ].forEach(pushIfMissing);

    if (['ecommerce', 'restaurant', 'hotel'].includes(kind))
      [
        'products',
        'product',
        'checkout',
        'profile',
        'confirmation',
        'login',
        'register',
      ].forEach(pushIfMissing);

    if (bulk.length) await models.Pages.create(bulk);
    return ok({});
  }),

  removePages: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    await models.Pages.deleteMany(input);
    return ok({});
  }),

  pagesFind: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    const pages = await models.Pages.find(input).lean();
    return ok(pages);
  }),

  menuFind: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    const menu = await models.MenuItems.find(input).sort({ order: 1 }).lean();
    return ok(menu);
  }),

  /* ---------- POSTS ---------- */
  postAdd: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    const post = await models.Posts.createPost(input);
    return ok(post);
  }),

  postEdit: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    const { _id, ...rest } = input;
    const post = await models.Posts.updatePost(_id, rest);
    return ok(post);
  }),

  postDelete: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { models } = ctx;
    const post = await models.Posts.deletePost(input);
    return ok(post);
  }),

  postsPaginated: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;

    const query = await queryBuilder(input, models);

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Posts,
      params: input,
      query,
    });

    return ok({ list, totalCount, pageInfo });
  }),

  postGet: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    const post = await models.Posts.findOne(input);
    return ok(post);
  }),

  postsFind: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    const posts = await models.Posts.find(input).lean();
    return ok(posts);
  }),
});
