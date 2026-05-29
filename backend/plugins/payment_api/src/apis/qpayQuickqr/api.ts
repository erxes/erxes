import { IModels } from '~/connectionResolvers';
import { PAYMENTS, PAYMENT_STATUS } from '~/constants';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { VendorBaseAPI } from './vendorBase';

export type QPayMerchantConfig = {
  username: string;
  password: string;
  merchantId?: string;
  mccCode?: string;
  bankCode?: string;
  bankAccount?: string;
  bankAccountName?: string;
  ibanNumber?: string;
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

interface IMerchantResponse {
  id: string;
  type: 'COMPANY' | 'PERSON';
  register_number: string;
  rows?: Array<{
    id: string;
    type: 'COMPANY' | 'PERSON';
    register_number: string;
  }>;
}

interface IInvoiceResponse {
  id: string;
  qr_image: string;
  invoice_status?: string;
  [key: string]: any;
}

export const meta = {
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

// Helper to safely convert any error-like value to a readable string
function toSafeString(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) {
    const msg = error.message;
    if (typeof msg === 'string') return msg;
    return JSON.stringify(msg);
  }
  if (typeof error === 'object') return JSON.stringify(error);
  return String(error);
}

export const quickQrCallbackHandler = async (models: IModels, data: any) => {
  const { _id } = data;

  if (!_id) {
    throw new Error('Invoice id is required');
  }

  const transaction = await models.Transactions.getTransaction({ _id });
  if (!transaction) {
    throw new Error(`Transaction not found with id: ${_id}`);
  }

  const payment = await models.PaymentMethods.getPayment(transaction.paymentId);
  if (!payment) {
    throw new Error(`Payment method not found for transaction: ${_id}`);
  }

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
  } catch (e: any) {
    throw new Error(toSafeString(e));
  }
};

export class QPayQuickQrAPI extends VendorBaseAPI {
  private domain: string;
  private config: QPayMerchantConfig;

  constructor(
    config: QPayMerchantConfig = { username: '', password: '' },
    domain?: string,
  ) {
    super({ isFlat: false });
    this.domain = domain || '';
    this.config = config;
  }

  async createCompany(args: IMerchantCompanyParams) {
    try {
      return await this.makeRequest<IMerchantResponse>({
        method: 'POST',
        path: meta.paths.company,
        data: {
          name: args.name,
          company_name: args.companyName,
          register_number: args.registerNumber,
          mcc_code: args.mccCode,
          city: args.city,
          district: args.district,
          address: args.address,
          phone: args.phone,
          email: args.email,
        },
      });
    } catch (error: any) {
      const errMsg = toSafeString(error);
      if (
        errMsg.includes('MERCHANT_ALREADY_REGISTERED') ||
        errMsg.includes('Бүртгэлтэй мерчант байна')
      ) {
        return await this.updateExistingMerchant({
          ...args,
          company_name: args.companyName,
          name: args.name,
        });
      }
      throw new Error(`Create company failed: ${errMsg}`);
    }
  }

  async updateCompany(args: IMerchantCompanyParams) {
    const safeName = args.name || args.companyName || 'Default Contact';
    return await this.makeRequest<IMerchantResponse>({
      method: 'PUT',
      path: `${meta.paths.company}/${this.config.merchantId}`,
      data: {
        name: safeName,
        company_name: args.companyName,
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        city: args.city,
        district: args.district,
        address: args.address,
        phone: args.phone,
        email: args.email,
      },
    });
  }

  async createCustomer(args: IMerchantCustomerParams) {
    try {
      return await this.makeRequest<IMerchantResponse>({
        method: 'POST',
        path: meta.paths.person,
        data: {
          first_name: args.firstName,
          last_name: args.lastName,
          business_name: args.businessName,
          register_number: args.registerNumber,
          mcc_code: args.mccCode,
          city: args.city,
          district: args.district,
          address: args.address,
          phone: args.phone,
          email: args.email,
        },
      });
    } catch (error: any) {
      const errMsg = toSafeString(error);
      if (
        errMsg.includes('MERCHANT_ALREADY_REGISTERED') ||
        errMsg.includes('Бүртгэлтэй мерчант байна')
      ) {
        return await this.updateExistingMerchant({
          ...args,
          first_name: args.firstName,
          last_name: args.lastName,
          business_name: args.businessName,
        });
      }
      throw new Error(`Create customer failed: ${errMsg}`);
    }
  }

  async updateCustomer(args: IMerchantCustomerParams) {
    const safeName = args.firstName && args.lastName
      ? `${args.firstName} ${args.lastName}`
      : 'Default Customer';
    return await this.makeRequest<IMerchantResponse>({
      method: 'PUT',
      path: `${meta.paths.person}/${this.config.merchantId}`,
      data: {
        name: safeName,
        first_name: args.firstName,
        last_name: args.lastName,
        business_name: args.businessName,
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        city: args.city,
        district: args.district,
        address: args.address,
        phone: args.phone,
        email: args.email,
      },
    });
  }

  async removeMerchant() {
    try {
      return await this.makeRequest<IMerchantResponse>({
        method: 'DELETE',
        path: `${meta.paths.getMerchant}/${this.config.merchantId}`,
      });
    } catch (e: any) {
      const message = toSafeString(e);
      if (message.includes('MERCHANT_NOTFOUND')) return;
      throw new Error(`Remove merchant failed: ${message}`);
    }
  }

  async updateExistingMerchant(args: any) {
    try {
      const existingMerchant = await this.findExistingMerchant(
        args.registerNumber,
      );
      if (!existingMerchant) return;

      const isCompany = existingMerchant.type === 'COMPANY';
      const path = isCompany ? meta.paths.company : meta.paths.person;

      let updateData: any = {
        register_number: args.registerNumber,
        mcc_code: args.mccCode,
        city: args.city,
        district: args.district,
        address: args.address,
        phone: args.phone,
        email: args.email,
      };

      if (isCompany) {
        updateData = {
          ...updateData,
          name: args.name || args.companyName || 'Default Contact',
          company_name: args.companyName,
        };
      } else {
        const fullName = args.firstName && args.lastName
          ? `${args.firstName} ${args.lastName}`
          : 'Default Customer';
        updateData = {
          ...updateData,
          name: fullName,
          first_name: args.firstName,
          last_name: args.lastName,
          business_name: args.businessName,
        };
      }

      return await this.makeRequest<IMerchantResponse>({
        method: 'PUT',
        path: `${path}/${existingMerchant.id}`,
        data: updateData,
      });
    } catch (e: any) {
      const message = toSafeString(e);
      throw new Error(`Update merchant failed: ${message}`);
    }
  }

  async createInvoice(invoice: ITransactionDocument) {
    const res = await this.makeRequest<IInvoiceResponse>({
      method: 'POST',
      path: meta.paths.invoice,
      data: {
        merchant_id: this.config.merchantId,
        amount: invoice.amount,
        currency: 'MNT',
        callback_url: `${this.domain}/pl:payment/callback/${PAYMENTS.qpayQuickqr.kind}?_id=${invoice._id}`,
        description: invoice.description || 'Гүйлгээ',
        mcc_code: this.config.mccCode,
        bank_accounts: [
          {
            default: true,
            account_bank_code: this.config.bankCode,
            account_number: this.config.bankAccount,
            account_name: this.config.bankAccountName,
            iban_number: this.config.ibanNumber,
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
    try {
      const res = await this.makeRequest<IInvoiceResponse>({
        method: 'POST',
        path: meta.paths.checkInvoice,
        data: { invoice_id: invoice.response.id },
      });
      return res.invoice_status === 'PAID' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING;
    } catch (e: any) {
      const message = toSafeString(e);
      throw new Error(`Invoice check failed: ${message}`);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    try {
      const res = await this.makeRequest<IInvoiceResponse>({
        method: 'POST',
        path: meta.paths.checkInvoice,
        data: { invoice_id: invoice.response.id },
      });
      return res.invoice_status === 'PAID' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING;
    } catch (e: any) {
      const message = toSafeString(e);
      throw new Error(`Manual check failed: ${message}`);
    }
  }

  async get(_id: string) {
    return await this.makeRequest<IMerchantResponse>({
      method: 'GET',
      path: `${meta.paths.getMerchant}/${_id}`,
    });
  }

  async list() {
    return await this.makeRequest<IMerchantResponse>({
      method: 'POST',
      path: meta.paths.merchantList,
      data: {
        offset: { page_number: 1, page_limit: 20 },
      },
    });
  }

  async findExistingMerchant(registerNumber: string): Promise<any | null> {
    let pageNumber = 1;
    const pageLimit = 20;

    while (true) {
      const list = await this.makeRequest<IMerchantResponse>({
        method: 'POST',
        path: meta.paths.merchantList,
        data: { offset: { page_number: pageNumber, page_limit: pageLimit } },
      });

      const found = list.rows?.find(
        (item) => item.register_number === registerNumber,
      );
      if (found) return found;

      if (!list.rows || list.rows.length < pageLimit) break;
      pageNumber++;
    }
    return null;
  }

  async getDistricts(city: string) {
    return await this.makeRequest<{ districts: string[] }>({
      method: 'GET',
      path: `${meta.paths.districts}/${city}`,
    });
  }
}
  async getDistricts(city: string) {
    return await this.makeRequest<{ districts: string[] }>({
      method: 'GET',
      path: `${meta.paths.districts}/${city}`,
    });
  }
}
