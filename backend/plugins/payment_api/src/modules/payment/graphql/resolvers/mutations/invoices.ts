import { splitType } from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';
import { getEnv, sendWorkerMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IInvoice } from '~/modules/payment/@types/invoices';

const mutations: Record<string, Resolver> = {
  async generateInvoiceUrl(
    _root,
    { input }: { input: IInvoice },
    { models }: IContext,
  ) {
    const domain = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:3001';

    if (!input.paymentIds?.length) {
      throw new Error('paymentIds is required');
    }

    const invoice = await models.Invoices.createInvoice({
      ...input,
    });

    // Get payment method (use first ID)
    const payment = await models.PaymentMethods.findOne({
      _id: input.paymentIds[0],
    });

    const kind = payment?.kind || 'unknown';

    //
    return `/pl:payment/widget/invoice/${invoice._id}?kind=${kind}&paymentId=${input.paymentIds[0]}`;
  },

  async invoiceCreate(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    return models.Invoices.createInvoice({ ...input }, subdomain);
  },

  async cpInvoiceCreate(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    return models.Invoices.createInvoice({ ...input }, subdomain);
  },

  async invoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) {
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      if (invoice.contentType) {
        const [, moduleName, collectionType] = splitType(invoice.contentType);

        sendWorkerMessage({
          subdomain,
          pluginName: 'payment',
          queueName: 'payments',
          jobName: 'paymentCallback',
          data: {
            ...invoice,
            status: 'paid',
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
          defaultValue: null,
          timeout: 30000,
          options: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        }).catch((err) => {
          process.stderr.write(
            `[invoicesCheck] Worker failed for ${_id}: ${err.stack}\n`,
          );
        });
      }

      if (invoice.callback) {
        fetch(invoice.callback, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: invoice._id,
            amount: invoice.amount,
            status: 'paid',
          }),
        }).catch((err) => {
          console.error(`[invoicesCheck] Callback failed for ${_id}:`, err);
        });
      }
    }

    return status;
  },

  async invoicesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Invoices.removeInvoices(_ids);
  },

  async invoiceUpdate(
    _root,
    { _id, paymentId }: { _id: string; paymentId: string },
    { models, subdomain }: IContext,
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:3001';

    const domain = DOMAIN.replace('<subdomain>', subdomain);

    return models.Invoices.updateInvoice(_id, {
      selectedPaymentId: paymentId,
      domain,
    });
  },
};

export default mutations;

// Wrapper configs
mutations.generateInvoiceUrl.wrapperConfig = {
  skipPermission: true,
};

mutations.invoiceCreate.wrapperConfig = {
  skipPermission: true,
};

mutations.invoicesCheck.wrapperConfig = {
  skipPermission: true,
};

mutations.cpInvoiceCreate.wrapperConfig = {
  skipPermission: true,
  forClientPortal: true,
};
