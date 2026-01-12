import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type PaymentTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<PaymentTRPCContext>().create();

export const appRouter = t.router({
  payment: {
    hello: t.procedure.query(() => {
      return 'Hello payment';
    }),
    addInvoice: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      return await models.Invoices.createInvoice(input, subdomain);
    }),
    getInvoiceWithTransactions: t.procedure
      .input(
        z.object({
          _id: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const invoice = await models.Invoices.getInvoice(
          { _id: input._id },
          true,
        );
        const transactions = await models.Transactions.find({
          invoiceId: invoice._id,
        }).lean();

        const transactionsWithPayments = await Promise.all(
          transactions.map(async (transaction) => {
            const payment = transaction.paymentId
              ? await models.PaymentMethods.findOne({
                  _id: transaction.paymentId,
                }).lean()
              : null;

            return {
              ...transaction,
              payment,
            };
          }),
        );

        return {
          ...invoice,
          transactions: transactionsWithPayments,
        };
      }),
  },
});

export type AppRouter = typeof appRouter;
