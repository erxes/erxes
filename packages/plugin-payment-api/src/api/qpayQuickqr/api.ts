import { IModels } from '../../connectionResolver';
import { IInvoiceDocument } from '../../models/definitions/invoices';
import { PAYMENTS, PAYMENT_STATUS } from '../constants';
import { VendorBaseAPI } from './vendorBase';
import * as QRCode from 'qrcode';

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
    company: 'merchant/company',
    person: 'merchant/person',
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

  const invoice = await models.Invoices.getInvoice(
    {
      identifier
    },
    true
  );

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
    super(config);
    this.domain = domain || '';
    this.config = config;
  }

  async createCompany(args: MerchantCommonParams & { name: string }) {
    try {
      return await this.makeRequest({
        method: 'POST',
        path: meta.paths.company,
        data: {
          ...args,
          register_number: args.registerNumber,
          mcc_code: args.mccCode
        }
      });
    } catch (e) {
      const errorObj = JSON.parse(e.message);

      if (errorObj.message === 'MERCHANT_ALREADY_REGISTERED') {
        return await this.updateExistingMerchant(args);
      }

      throw new Error(e.message);
    }
  }

  async updateCompany(args: MerchantCommonParams & { name: string }) {
    return await this.makeRequest({
      method: 'PUT',
      path: `${meta.paths.company}/${this.config.merchantId}`,
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
    try {
      return await this.makeRequest({
        method: 'POST',
        path: meta.paths.person,
        data: {
          ...args,
          register_number: args.registerNumber,
          mcc_code: args.mccCode,
          first_name: args.firstName,
          last_name: args.lastName
        }
      });
    } catch (e) {
      const errorObj = JSON.parse(e.message);

      if (errorObj.message === 'MERCHANT_ALREADY_REGISTERED') {
        return await this.updateExistingMerchant({
          ...args,
          first_name: args.firstName,
          last_name: args.lastName
        });
      }

      throw new Error(e.message);
    }
  }

  async updateCustomer(
    args: MerchantCommonParams & { firstName: string; lastName: string }
  ) {
    return await this.makeRequest({
      method: 'PUT',
      path: `${meta.paths.person}/${this.config.merchantId}`,
      data: {
        ...args,
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        first_name: args.firstName,
        last_name: args.lastName
      }
    });
  }

  async removeMerchant() {
    try {
      return await this.makeRequest({
        method: 'DELETE',
        path: `${meta.paths.getMerchant}/${this.config.merchantId}`
      });
    } catch (e) {
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
            register_number: args.registerNumber,
            mcc_code: args.mccCode
          }
        });
      }
    }
  }

  async createInvoice(invoice: IInvoiceDocument) {
    const res = await this.makeRequest({
      method: 'POST',
      path: meta.paths.invoice,
      data: {
        merchant_id: this.config.merchantId,
        amount: invoice.amount,
        currency: 'MNT',
        // customer_name: 'erxes',
        // customer_logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoCx7dnStzjd7CH3KKtZ6WR5pxNkAtwY-yVA&usqp=CAU',
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

    return {
      ...res,
      qrData: await QRCode.toDataURL(res.qr_code)
    };
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

  async manualCheck(invoice: IInvoiceDocument) {
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

  async list() {
    return await this.makeRequest({
      method: 'POST',
      path: meta.paths.merchantList
    });
  }
}
