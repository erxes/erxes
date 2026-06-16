import { Resolver } from 'erxes-api-shared/core-types';
import { getEnv, graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IInvoice } from '~/modules/payment/@types/invoices';
import { runPaidInvoiceSideEffects } from '~/modules/payment/utils/paidInvoiceSideEffects';

const mutations: Record<string, Resolver<any, any, IContext>> = {
  async generateInvoiceUrl(
    _root,
    { input }: { input: IInvoice },
    { models, subdomain }: IContext,
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:5173';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    if (!input.paymentIds || input.paymentIds.length === 0) {
      throw new Error('paymentIds is required');
    }

    const invoice = await models.Invoices.createInvoice({ ...input });

    return `${domain}/pl:payment/widget/invoice/${invoice._id}`;
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
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:5173';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    if (!input.paymentIds || input.paymentIds.length === 0) {
      throw new Error('paymentIds is required');
    }

    const invoice = await models.Invoices.createInvoice({ ...input });

    return `${domain}/pl:payment/widget/invoice/${invoice._id}`;
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
    const invoiceBefore = await models.Invoices.getInvoice({ _id }, true);
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      await runPaidInvoiceSideEffects({
        models,
        subdomain,
        invoice,
        invoiceWasPaid: invoiceBefore.status === 'paid',
      });
    }

    return status;
  },

  async cpInvoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext,
  ) {
    const invoiceBefore = await models.Invoices.getInvoice({ _id }, true);
    const status = await models.Invoices.checkInvoice(_id, subdomain);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id }, true);

      await runPaidInvoiceSideEffects({
        models,
        subdomain,
        invoice,
        invoiceWasPaid: invoiceBefore.status === 'paid',
      });
    }

    return status;
  },

  async invoiceScanBarcode(
    _root,
    { code }: { code: string },
    { models }: IContext,
  ) {
    const invoice = await models.Invoices.findOne({
      invoiceNumber: code,
    }).lean();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'paid') {
      throw new Error('Invoice is not paid');
    }

    const scanned = await models.Invoices.scanBarcode(code);

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
      : 'http://localhost:5173';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    return models.Invoices.updateInvoice(_id, {
      selectedPaymentId: paymentId,
      domain,
    });
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
