import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const relationTrpcRouter = t.router({
  relation: t.router({
    getRelationsByEntities: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.getRelationsByEntities(input);
      }),

    getRelationByEntity: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.getRelationsByEntity(input);
      }),

    createRelation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.createRelation(input);
      }),

    updateRelation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.updateRelation(input);
      }),

    deleteRelation: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return models.Relations.deleteRelation(input);
      }),
  }),
});
