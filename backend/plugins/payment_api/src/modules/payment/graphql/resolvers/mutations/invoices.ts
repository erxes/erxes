import { Resolver } from 'erxes-api-shared/core-types';
import { getEnv, graphqlPubsub } from 'erxes-api-shared/utils';
import { CURRENCIES, PAYMENT_STATUS } from '~/constants';
import { IContext } from '~/connectionResolvers';
import { IInvoice, IInvoiceEditInput } from '~/modules/payment/@types/invoices';
import { buildInvoiceUrl } from '~/modules/payment/services/invoiceUrl';
import {
  enqueuePaidInvoiceCallback,
  resolvePaymentForInvoice,
  sendPaidInvoiceQrEmail,
} from '~/modules/payment/services/paidInvoiceCallback';

const mutations: Record<string, Resolver<any, any, IContext>> = {
  async generateInvoiceUrl(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    if (!input.paymentIds || input.paymentIds.length === 0) {
      throw new Error('paymentIds is required');
    }

    const invoice = await models.Invoices.createInvoice(
      { ...input },
      subdomain,
    );

    return buildInvoiceUrl(subdomain, invoice._id);
  },

  async invoiceCreate(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    const invoice = await models.Invoices.createInvoice(
      {
        ...input,
      },
      subdomain,
    );
    return invoice;
  },

  async cpGenerateInvoiceUrl(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    if (!input.paymentIds || input.paymentIds.length === 0) {
      throw new Error('paymentIds is required');
    }

    const invoice = await models.Invoices.createInvoice(
      { ...input },
      subdomain,
    );

    return buildInvoiceUrl(subdomain, invoice._id);
  },

  async cpInvoiceCreate(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    const invoice = await models.Invoices.createInvoice(
      {
        ...input,
      },
      subdomain,
    );
    return invoice;
  },

  async invoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) {
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      const payment = await resolvePaymentForInvoice(models, invoice);

      enqueuePaidInvoiceCallback(
        subdomain,
        models,
        invoice,
        payment,
        'invoicesCheck',
      );

      if (invoice.callback) {
        // Fire callback – do not await
        fetch(invoice.callback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: invoice._id,
            amount: invoice.amount,
            status: 'paid',
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} – ${res.statusText}`);
            }
            console.log(
              `[invoicesCheck] Callback succeeded for invoice ${_id}`,
            );
          })
          .catch((err) => {
            console.error(
              `[invoicesCheck] Callback failed for invoice ${_id}:`,
              err,
            );
          });
      }
    }

    return status;
  },
  // --- END OF UPDATED MUTATION ---

  async cpInvoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) {
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      const payment = await resolvePaymentForInvoice(models, invoice);

      enqueuePaidInvoiceCallback(
        subdomain,
        models,
        invoice,
        payment,
        'cpInvoicesCheck',
      );

      if (invoice.callback) {
        // Fire callback – do not await
        fetch(invoice.callback, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            _id: invoice._id,
            amount: invoice.amount,
            status: 'paid',
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} – ${res.statusText}`);
            }
            console.log(
              `[invoicesCheck] Callback succeeded for invoice ${_id}`,
            );
          })
          .catch((err) => {
            console.error(
              `[invoicesCheck] Callback failed for invoice ${_id}:`,
              err,
            );
          });
      }
    }

    return status;
  },

  async invoiceScanBarcode(
    _root,
    { code, eventSlug }: { code: string; eventSlug?: string },
    { models }: IContext,
  ) {
    const scanned = await models.Invoices.scanBarcode(code, eventSlug);

    graphqlPubsub.publish(`invoiceUpdated:${scanned._id}`, {
      invoiceUpdated: scanned,
    });

    graphqlPubsub.publish('invoiceScanned', {
      invoiceScanned: scanned,
    });

    return scanned;
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
      : getEnv({ name: 'REACT_APP_API_URL' }) || 'http://localhost:4000';

    const domain = DOMAIN.replace('<subdomain>', subdomain);

    return models.Invoices.updateInvoice(_id, {
      selectedPaymentId: paymentId,
      domain,
    });
  },

  async invoiceEdit(
    _root,
    { _id, input }: { _id: string; input: IInvoiceEditInput },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('paymentInvoiceEdit');

    const invoice = await models.Invoices.getInvoice({ _id });

    const doc: IInvoiceEditInput & { resolvedAt?: Date } = {};

    if (input.description !== undefined) {
      doc.description = input.description;
    }

    if (input.amount !== undefined) {
      if (!(input.amount > 0)) {
        throw new Error('Amount must be greater than 0');
      }

      doc.amount = input.amount;
    }

    if (input.currency !== undefined) {
      if (!CURRENCIES.includes(input.currency)) {
        throw new Error(`Unsupported currency: ${input.currency}`);
      }

      doc.currency = input.currency;
    }

    if (input.status !== undefined) {
      if (!PAYMENT_STATUS.ALL.includes(input.status)) {
        throw new Error(`Unsupported status: ${input.status}`);
      }

      doc.status = input.status;

      if (input.status === PAYMENT_STATUS.PAID && !invoice.resolvedAt) {
        doc.resolvedAt = new Date();
      }
    }

    if (Object.keys(doc).length === 0) {
      throw new Error('Nothing to update');
    }

    const updated = await models.Invoices.updateInvoice(_id, doc);

    if (doc.status && doc.status !== invoice.status) {
      graphqlPubsub.publish(`invoiceUpdated:${_id}`, {
        invoiceUpdated: {
          _id,
          status: updated.status,
        },
      });

      if (doc.status === PAYMENT_STATUS.PAID) {
        const paidInvoice = await models.Invoices.getInvoice({ _id }, true);
        const payment = await resolvePaymentForInvoice(models, paidInvoice);

        sendPaidInvoiceQrEmail(
          subdomain,
          models,
          paidInvoice,
          payment,
          'invoiceEdit',
        );
      }
    }

    return updated;
  },

  async cpInvoiceUpdate(
    _root,
    {
      _id,
      contentType,
      contentTypeId,
    }: { _id: string; contentType: string; contentTypeId: string },
    { models }: IContext,
  ) {
    const invoice = await models.Invoices.getInvoice({ _id });

    if (invoice.contentType && invoice.contentTypeId) {
      throw new Error('Content type and ID already set for this invoice');
    }

    return models.Invoices.updateOne(
      { _id },
      {
        contentType: contentType || invoice.contentType,
        contentTypeId: contentTypeId || invoice.contentTypeId,
      },
    );
  },
};

export default mutations;

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
};

mutations.invoiceScanBarcode.wrapperConfig = {
  skipPermission: true,
};

mutations.cpInvoicesCheck.wrapperConfig = {
  forClientPortal: true,
};

mutations.cpGenerateInvoiceUrl.wrapperConfig = {
  forClientPortal: true,
};

mutations.cpInvoiceUpdate.wrapperConfig = {
  forClientPortal: true,
};
