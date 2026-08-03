import { Resolver } from 'erxes-api-shared/src/core-types';
import { IContext } from '~/connectionResolvers';

const mutations: Record<string, Resolver> = {
  async paymentTransactionsAdd(
    _root,
    args: any,
    { models, subdomain }: IContext,
  ) {
     console.log('[MUTATION] paymentTransactionsAdd called', args.input);
    const { input } = args;
    const invoice = await models.Invoices.getInvoice(
      { _id: input.invoiceId },
      true,
    );

    const description = invoice.description || invoice.invoiceNumber;

    return models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });
  },

  async cpPaymentTransactionsAdd(
    _root,
    args: any,
    { models, subdomain }: IContext,
  ) {
    console.log('[MUTATION] cpPaymentTransactionsAdd', {
    subdomain,
    input: args.input,
    });

    const { input } = args;
    const invoice = await models.Invoices.getInvoice(
      { _id: input.invoiceId },
      true,
    );

    const description = invoice.description || invoice.invoiceNumber;

    return models.Transactions.createTransaction({
      ...input,
      subdomain,
      description,
      details: { ...input.details, ...invoice.data },
    });
  },
};

mutations.paymentTransactionsAdd.wrapperConfig = {
  skipPermission: true,
};

mutations.cpPaymentTransactionsAdd.wrapperConfig = {
  forClientPortal: true,
};

export default mutations;
