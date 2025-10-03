import { IContext } from '~/connectionResolvers';

const mutations = {
  async paymentTransactionsAdd(_root, args: any, { models, subdomain }: IContext) {
    const { input } = args;
    const invoice = await models.Invoices.getInvoice({_id: input.invoiceId}, true);

    const description = invoice.description || invoice.invoiceNumber;

    return models.Transactions.createTransaction({ ...input, subdomain, description, details: {...input.details, ...invoice.data} });
  },
};

export default mutations;
