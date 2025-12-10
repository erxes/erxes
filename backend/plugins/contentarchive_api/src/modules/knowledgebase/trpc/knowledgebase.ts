import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { ok, err } from 'erxes-api-shared/utils';
import { ContentTRPCContext } from '~/trpc/init-trpc';

const t = initTRPC.context<ContentTRPCContext>().create();

/* ------------------------------------------------------------------ */
/* Topics                                                             */
/* ------------------------------------------------------------------ */
const topicRouter = t.router({
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const topic = await ctx.models.KnowledgeBaseTopics.findOne(
        input.query,
      ).lean();
      return ok(topic);
    } catch (e) {
      return err({ code: 'TOPIC_FIND_ONE_FAILED', message: e.message });
    }
  }),

  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const list = await ctx.models.KnowledgeBaseTopics.find(
        input.query,
      ).lean();
      return ok(list);
    } catch (e) {
      return err({ code: 'TOPIC_FIND_FAILED', message: e.message });
    }
  }),

  count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const n = await ctx.models.KnowledgeBaseTopics.find(
        input.query,
      ).countDocuments();
      return ok(n);
    } catch (e) {
      return err({ code: 'TOPIC_COUNT_FAILED', message: e.message });
    }
  }),
});

/* ------------------------------------------------------------------ */
/* Articles                                                           */
/* ------------------------------------------------------------------ */
const articleRouter = t.router({
  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const list = await ctx.models.KnowledgeBaseArticles.find(input.query)
        .sort(input.sort)
        .lean();
      return ok(list);
    } catch (e) {
      return err({ code: 'ARTICLE_FIND_FAILED', message: e.message });
    }
  }),

  count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const n = await ctx.models.KnowledgeBaseArticles.countDocuments(
        input.query,
      );
      return ok(n);
    } catch (e) {
      return err({ code: 'ARTICLE_COUNT_FAILED', message: e.message });
    }
  }),
});

/* ------------------------------------------------------------------ */
/* Categories                                                         */
/* ------------------------------------------------------------------ */
const categoryRouter = t.router({
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const cat = await ctx.models.KnowledgeBaseCategories.findOne(
        input.query,
      ).lean();
      return ok(cat);
    } catch (e) {
      return err({ code: 'CATEGORY_FIND_ONE_FAILED', message: e.message });
    }
  }),

  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const list = await ctx.models.KnowledgeBaseCategories.find(
        input.query,
      ).lean();
      return ok(list);
    } catch (e) {
      return err({ code: 'CATEGORY_FIND_FAILED', message: e.message });
    }
  }),
});

/* ------------------------------------------------------------------ */
/* Combined export                                                    */
/* ------------------------------------------------------------------ */
export const knowledgebaseRouter = t.router({
  topic: topicRouter,
  article: articleRouter,
  category: categoryRouter,
});
