import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getOrCreateInvoiceUrl } from '~/modules/payment/services/invoiceUrl';

export type PaymentTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<PaymentTRPCContext>().create();

const invoiceUrlInput = z.object({
  amount: z.number().positive(),
  currency: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  customerId: z.string().optional(),
  customerType: z.string().optional(),
  contentType: z.string().min(1),
  contentTypeId: z.string().min(1),
  redirectUri: z.string().optional(),
  paymentIds: z.array(z.string()).min(1),
  data: z.unknown().optional(),
  warningText: z.string().optional(),
  callback: z.string().optional(),
});

export const appRouter = t.router({
  payment: {
    hello: t.procedure.query(() => {
      return 'Hello payment';
    }),
    addInvoice: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      return await models.Invoices.createInvoice(input, subdomain);
    }),
    getOrCreateInvoiceUrl: t.procedure
      .input(invoiceUrlInput)
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        return await getOrCreateInvoiceUrl({ input, models, subdomain });
      }),
    addTransaction: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const invoice = await models.Invoices.getInvoice(
          { _id: input.invoiceId },
          true,
        );
        const description = invoice.description || invoice.invoiceNumber;

        return await models.Transactions.createTransaction({
          ...input,
          subdomain,
          description,
          details: { ...input.details, ...invoice.data },
        });
      }),
    checkInvoice: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        return await models.Invoices.checkInvoice(input._id, subdomain);
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
  invoices: {
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;

      return models.Invoices.find(input).lean();
    }),
  },
});

export type AppRouter = typeof appRouter;
