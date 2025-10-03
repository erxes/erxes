import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const userTrpcRouter = t.router({
  users: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Users.find(query);
    }),
    findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Users.findOne(query);
    }),

    updateOne: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { selector, modifier } = input;
      const { models } = ctx;

      return models.Users.updateOne(selector, modifier);
    }),

    updateMany: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { selector, modifier } = input;
      const { models } = ctx;

      return models.Users.updateMany(selector, modifier);
    }),

    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { data } = input;
      const { models } = ctx;

      return models.Users.createUser(data);
    }),

    setActiveStatus: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { _id } = input;
        const { models } = ctx;

        return models.Users.setUserActiveOrInactive(_id);
      }),

    getCount: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return models.Users.countDocuments(query);
    }),

    comparePassword: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { password, userPassword } = input;
        const { models } = ctx;

        return models.Users.comparePassword(password, userPassword);
      }),
  }),
});
