import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { isSenderAllowed, resolveAlignedFrom } from '~/utils/email/senders';
import { createSuppressionPort } from '~/utils/email/ports';

const t = initTRPC.context<CoreTRPCContext>().create();

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

  emailSuppression: t.router({
    blocked: t.procedure
      .input(
        z.object({
          emails: z.array(z.string()),
          source: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return await createSuppressionPort(models).blocked(
          input.emails,
          input.source,
        );
      }),
  }),

  emailSenders: t.router({
    isAllowed: t.procedure
      .input(z.object({ email: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return await isSenderAllowed(models, input.email);
      }),

    alignedFrom: t.procedure.query(async ({ ctx }) => {
      const { models } = ctx;

      return await resolveAlignedFrom(models);
    }),
  }),
});
