import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { isSenderAllowed } from '~/utils/email/senders';

const t = initTRPC.context<CoreTRPCContext>().create();

/**
 * Lets services without their own database reach the org's email records and
 * sender rules. The automations service is the caller today; it holds no models
 * and must not re-implement either.
 */
export const emailTrpcRouter = t.router({
  emailDeliveries: t.router({
    create: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;

      const delivery = await models.EmailDeliveries.createEmailDelivery({
        ...input,
        status: 'queued',
      });

      return delivery?._id;
    }),

    recordHandoff: t.procedure
      .input(z.object({ _id: z.string(), patch: z.any() }))
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        await models.EmailDeliveries.recordHandoff(input._id, input.patch);

        return 'success';
      }),
  }),

  emailSenders: t.router({
    isAllowed: t.procedure
      .input(z.object({ email: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return await isSenderAllowed(models, input.email);
      }),
  }),
});
