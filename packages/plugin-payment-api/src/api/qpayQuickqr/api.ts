import { IModels, generateModels } from '../../connectionResolver';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { VendorBaseAPI } from './vendorBase';

export type QPayMerchantConfig = {
  username: string;
  password: string;
};

type MerchantCommonParams = {
  registerNumber: string;
  mccCode: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
};

export const meta = {
  // apiUrl: 'https://sandbox-quickqr.qpay.mn',
  apiUrl: 'https://quickqr.qpay.mn',
  apiVersion: 'v2',

  paths: {
    auth: 'auth/token',
    refresh: 'auth/refresh',
    createCompany: 'merchant/company',
    createPerson: 'merchant/person',
    getMerchant: 'merchant',
    merchantList: 'merchant/list',
    checkInvoice: 'payment/check',

    invoice: 'invoice'
  }
};

export const quickQrCallbackHandler = async (models: IModels, data: any) => {
  const { identifier } = data;

  if (!identifier) {
    throw new Error('Invoice id is required');
  }

  const invoice = await models.Invoices.getInvoice({
    identifier
  });

  const payment = await models.Payments.getPayment(invoice.selectedPaymentId);

  if (payment.kind !== PAYMENTS.qpayQuickqr.kind) {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new QPayQuickQrAPI(payment.config);
    const status = await api.checkInvoice(invoice);

    if (status !== PAYMENT_STATUS.PAID) {
      return invoice;
    }

    await models.Invoices.updateOne(
      { _id: invoice._id },
      {
        $set: {
          status,
          resolvedAt: new Date()
        }
      }
    );

    invoice.status = status;

    return invoice;
  } catch (e) {
    throw new Error(e.message);
  }
};

export class QPayQuickQrAPI extends VendorBaseAPI {
  private domain: string;
  private config: any;

  constructor(config?: any, domain?: string) {
    super();
    this.domain = domain || '';
    this.config = config;
  }

  async createCompany(args: MerchantCommonParams & { name: string }) {
    return await this.makeRequest({
      method: 'POST',
      path: meta.paths.createCompany,
      data: {
        ...args,
        register_number: args.registerNumber,
        mcc_code: args.mccCode
      }
    });
  }

  async createCustomer(
    args: MerchantCommonParams & { firstName: string; lastName: string }
  ) {
    return await this.makeRequest({
      method: 'POST',
      path: meta.paths.createPerson,
      data: {
        ...args,
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        first_name: args.firstName,
        last_name: args.lastName
      }
    });
  }

  async createInvoice(invoice: IInvoiceDocument) {
    return await this.makeRequest({
      method: 'POST',
      path: meta.paths.invoice,
      data: {
        merchant_id: this.config.merchantId,
        amount: invoice.amount,
        currency: 'MNT',
        // customer_name: 'TDB',
        // customer_logo: '',
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.qpayQuickqr.kind}?identifier=${invoice.identifier}`,
        description: invoice.description || 'Гүйлгээ',
        mcc_code: this.config.mccCode,
        bank_accounts: [
          {
            default: true,
            account_bank_code: this.config.bankCode,
            account_number: this.config.bankAccount,
            account_name: this.config.bankAccountName,
            is_default: true
          }
        ]
      }
    });
  }

  async checkInvoice(invoice: IInvoiceDocument) {
    try {
      const res = await this.makeRequest({
        method: 'POST',
        path: meta.paths.checkInvoice,
        data: {
          invoice_id: invoice.apiResponse.id
        }
      });

      if (res.invoice_status === 'PAID') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async get(_id: string) {
    return await this.makeRequest({
      method: 'GET',
      path: `${meta.paths.getMerchant}/${_id}`
    });
  }
}
