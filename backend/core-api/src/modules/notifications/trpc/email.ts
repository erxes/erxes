import { initTRPC } from '@trpc/server';
import { toDeliveryLogProvider } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';
import { isSenderAllowed, resolveAlignedFrom } from '~/utils/email/senders';
import { createSuppressionPort } from '~/utils/email/ports';

const t = initTRPC.context<CoreTRPCContext>().create();

const deliveryInput = z.object({
  toEmails: z.array(z.string()),
  ccEmails: z.array(z.string()).optional(),
  from: z.string(),
  subject: z.string(),
  provider: z.enum(['SES', 'sendgrid', 'custom']),
  source: z.string().optional(),
  sourceId: z.string().optional(),
  userId: z.string().optional(),
  notificationId: z.string().optional(),
});

const handoffPatch = z.object({
  status: z.enum(['sent', 'failed']),
  sentAt: z.coerce.date(),
  messageId: z.string().optional(),
  providerResponse: z.string().optional(),
  rejected: z.array(z.string()).optional(),
  error: z.string().optional(),
});

export const emailTrpcRouter = t.router({
  emailDeliveries: t.router({
    create: t.procedure
      .input(deliveryInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        const delivery = await models.EmailDeliveries.createEmailDelivery({
          ...input,
          provider: toDeliveryLogProvider(input.provider),
          status: 'queued',
        });

        return delivery?._id;
      }),

    recordHandoff: t.procedure
      .input(z.object({ _id: z.string(), patch: handoffPatch }))
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

        const emails = await createSuppressionPort(models).blocked(
          input.emails,
          input.source,
        );

        return { emails };
      }),
  }),

  emailSenders: t.router({
    isAllowed: t.procedure
      .input(z.object({ email: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return { allowed: await isSenderAllowed(models, input.email) };
      }),

    alignedFrom: t.procedure.query(async ({ ctx }) => {
      const { models } = ctx;

      return await resolveAlignedFrom(models);
    }),
  }),
});
