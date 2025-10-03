import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const conformityTrpcRouter = t.router({
  conformity: t.router({
    addConformity: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.addConformity(input);
      }),

    savedConformity: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.savedConformity(input);
      }),

    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      return models.Conformities.create(input);
    }),

    removeConformities: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.removeConformities(input);
      }),

    removeConformity: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.removeConformity(input);
      }),

    getConformities: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.getConformities(input);
      }),

    addConformities: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.addConformities(input);
      }),

    relatedConformity: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.relatedConformity(input);
      }),

    filterConformity: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.filterConformity(input);
      }),

    changeConformity: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.changeConformity(input);
      }),

    findConformities: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.find(input).lean();
      }),

    editConformity: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return models.Conformities.editConformity(input);
      }),
  }),
});
