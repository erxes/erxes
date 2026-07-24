import { getEnv } from 'erxes-api-shared/utils';
import { PAYMENT_STATUS } from '~/constants';
import type { IModels } from '~/connectionResolvers';
import type { IInvoice } from '~/modules/payment/@types/invoices';

export type TInvoiceUrlInput = {
  amount: number;
  currency?: string;
  phone?: string;
  email?: string;
  description?: string;
  customerId?: string;
  customerType?: string;
  contentType: string;
  contentTypeId: string;
  redirectUri?: string;
  paymentIds: string[];
  data?: unknown;
  warningText?: string;
  callback?: string;
};

type TInvoiceUrlRecord = {
  _id: string;
};

type TResolveInvoiceUrlDependencies = {
  createInvoice: (doc: IInvoice) => Promise<TInvoiceUrlRecord>;
  findPendingInvoice: (
    input: TInvoiceUrlInput,
    currency: string,
  ) => Promise<TInvoiceUrlRecord | null>;
};

export const buildInvoiceUrl = (subdomain: string, invoiceId: string) => {
  const configuredDomain = getEnv({ name: 'DOMAIN' });
  const domain = configuredDomain
    ? `${configuredDomain}/gateway`
    : getEnv({ name: 'REACT_APP_API_URL' }) || 'http://localhost:4000';

  return `${domain.replace(
    '<subdomain>',
    subdomain,
  )}/pl:payment/widget/invoice/${invoiceId}`;
};

export const resolveInvoiceUrl = async ({
  dependencies,
  input,
  subdomain,
}: {
  dependencies: TResolveInvoiceUrlDependencies;
  input: TInvoiceUrlInput;
  subdomain: string;
}) => {
  if (!input.amount || input.amount <= 0) {
    throw new Error('Amount is required');
  }

  if (!input.paymentIds.length) {
    throw new Error('paymentIds is required');
  }

  const currency = input.currency || 'MNT';
  const existingInvoice = await dependencies.findPendingInvoice(
    input,
    currency,
  );

  const invoice =
    existingInvoice ||
    (await dependencies.createInvoice({
      invoiceNumber: '',
      amount: input.amount,
      currency,
      phone: input.phone || '',
      email: input.email || '',
      description: input.description,
      status: PAYMENT_STATUS.PENDING,
      customerType: input.customerType || '',
      customerId: input.customerId || '',
      contentType: input.contentType,
      contentTypeId: input.contentTypeId,
      createdAt: new Date(),
      redirectUri: input.redirectUri,
      paymentIds: input.paymentIds,
      data: input.data,
      warningText: input.warningText,
      callback: input.callback,
    } satisfies IInvoice));

  return {
    invoiceId: invoice._id,
    url: buildInvoiceUrl(subdomain, invoice._id),
  };
};

export const getOrCreateInvoiceUrl = ({
  input,
  models,
  subdomain,
}: {
  input: TInvoiceUrlInput;
  models: IModels;
  subdomain: string;
}) =>
  resolveInvoiceUrl({
    input,
    subdomain,
    dependencies: {
      findPendingInvoice: async (invoiceInput, currency) =>
        models.Invoices.findOne({
          amount: invoiceInput.amount,
          contentType: invoiceInput.contentType,
          contentTypeId: invoiceInput.contentTypeId,
          currency,
          paymentIds: {
            $all: invoiceInput.paymentIds,
            $size: invoiceInput.paymentIds.length,
          },
          status: PAYMENT_STATUS.PENDING,
        }),
      createInvoice: (doc) => models.Invoices.createInvoice(doc, subdomain),
    },
  });
