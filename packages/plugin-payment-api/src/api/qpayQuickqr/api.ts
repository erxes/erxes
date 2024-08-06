import { IModels } from '../../connectionResolver';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import { ITransactionDocument } from '../../models/definitions/transactions';
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

interface IMerchantCompanyParams extends MerchantCommonParams {
  companyName: string;
  name: string;
}

interface IMerchantCustomerParams extends MerchantCommonParams {
  businessName: string;
  firstName: string;
  lastName: string;
}

export const meta = {
  // apiUrl: 'https://sandbox-quickqr.qpay.mn',
  apiUrl: 'https://quickqr.qpay.mn',
  apiVersion: 'v2',

  paths: {
    auth: 'auth/token',
    refresh: 'auth/refresh',
    company: 'merchant/company',
    person: 'merchant/person',
    getMerchant: 'merchant',
    merchantList: 'merchant/list',
    checkInvoice: 'payment/check',
    cities: 'aimaghot',
    districts: 'sumduureg',
    invoice: 'invoice',
  },
};

export const quickQrCallbackHandler = async (models: IModels, data: any) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction({
    _id,
  });

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);

  if (payment.kind !== PAYMENTS.qpayQuickqr.kind) {
    throw new Error('Payment config type is mismatched');
  }

  try {
    const api = new QPayQuickQrAPI(payment.config);
    const status = await api.checkInvoice(transaction);

    if (status !== PAYMENT_STATUS.PAID) {
      return transaction;
    }

    transaction.status = status;
    transaction.updatedAt = new Date();

    await transaction.save();

    return transaction;
  } catch (e) {
    throw new Error(e.message);
  }
};

export class QPayQuickQrAPI extends VendorBaseAPI {
  private domain: string;
  private config: any;

  constructor(config?: any, domain?: string) {
    super(config);
    this.domain = domain || '';
    this.config = config;
  }

  async createCompany(args: IMerchantCompanyParams) {
    try {
      return await this.makeRequest({
        method: 'POST',
        path: meta.paths.company,
        data: {
          ...args,
          register_number: args.registerNumber,
          mcc_code: args.mccCode,
          company_name: args.companyName,
        },
      });
    } catch (e) {
      if (e.message.includes('MERCHANT_ALREADY_REGISTERED')) {
        return await this.updateExistingMerchant({
          ...args,
          company_name: args.companyName,
          name: args.name,
        });
      }

      throw new Error(e);
    }
  }

  async updateCompany(args: IMerchantCompanyParams) {
    return await this.makeRequest({
      method: 'PUT',
      path: `${meta.paths.company}/${this.config.merchantId}`,
      data: {
        ...args,
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        company_name: args.companyName,
      },
    });
  }

  async createCustomer(args: IMerchantCustomerParams) {
    try {
      const res = await this.makeRequest({
        method: 'POST',
        path: meta.paths.person,
        data: {
          ...args,
          register_number: args.registerNumber,
          mcc_code: args.mccCode,
          first_name: args.firstName,
          last_name: args.lastName,
          business_name: args.businessName,
        },
      });

      return res;
    } catch (e) {
      if (e.message.includes('MERCHANT_ALREADY_REGISTERED')) {
        return await this.updateExistingMerchant({
          ...args,
          first_name: args.firstName,
          last_name: args.lastName,
        });
      }

      throw new Error(e);
    }
  }

  async updateCustomer(args: IMerchantCustomerParams) {
    return await this.makeRequest({
      method: 'PUT',
      path: `${meta.paths.person}/${this.config.merchantId}`,
      data: {
        ...args,
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        first_name: args.firstName,
        last_name: args.lastName,
        business_name: args.businessName,
      },
    });
  }

  async removeMerchant() {
    try {
      return await this.makeRequest({
        method: 'DELETE',
        path: `${meta.paths.getMerchant}/${this.config.merchantId}`,
      });
    } catch (e) {
      if (e.message.includes('MERCHANT_NOTFOUND')) {
        return;
      }
      throw new Error(e.message);
    }
  }

  async updateExistingMerchant(args: any) {
    const list = await this.list();

    if (list.rows.length > 0) {
      const existingMerchant = list.rows.find(
        (item: any) => item.register_number === args.registerNumber
      );
      const path =
        existingMerchant.type === 'COMPANY'
          ? meta.paths.company
          : meta.paths.person;
      if (existingMerchant) {
        return this.makeRequest({
          method: 'PUT',
          path: `${path}/${existingMerchant.id}`,
          data: {
            ...args,
            business_name: args.businessName,
            register_number: args.registerNumber,
            mcc_code: args.mccCode,
          },
        });
      }
    }
  }

  async createInvoice(invoice: ITransactionDocument) {
    const res = await this.makeRequest({
      method: 'POST',
      path: meta.paths.invoice,
      data: {
        merchant_id: this.config.merchantId,
        amount: invoice.amount,
        currency: 'MNT',
        // customer_name: 'erxes',
        // customer_logo: 'https://erxes.io/static/images/logo/icon.png',
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.qpayQuickqr.kind}?_id=${invoice._id}`,
        description: invoice.description || 'Гүйлгээ',
        mcc_code: this.config.mccCode,
        bank_accounts: [
          {
            default: true,
            account_bank_code: this.config.bankCode,
            account_number: this.config.bankAccount,
            account_name: this.config.bankAccountName,
            is_default: true,
          },
        ],
      },
    });
    
    return {
      ...res,
      qrData: `data:image/jpg;base64,${res.qr_image}`,
    };
  }

  async checkInvoice(invoice: ITransactionDocument) {
    // return 'paid'

    try {
      const res = await this.makeRequest({
        method: 'POST',
        path: meta.paths.checkInvoice,
        data: {
          invoice_id: invoice.response.id,
        },
      });

      if (res.invoice_status === 'PAID') {
        return PAYMENT_STATUS.PAID;
      }

      return PAYMENT_STATUS.PENDING;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    // return ""
    try {
      const res = await this.makeRequest({
        method: 'POST',
        path: meta.paths.checkInvoice,
        data: {
          invoice_id: invoice.response.id,
        },
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
      path: `${meta.paths.getMerchant}/${_id}`,
    });
  }

  async list() {
    return await this.makeRequest({
      method: 'POST',
      path: meta.paths.merchantList,
    });
  }

  async getDistricts(city: string) {
    return await this.makeRequest({
      method: 'GET',
      path: `${meta.paths.districts}/${city}`,
    });
  }
}
