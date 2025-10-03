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
      console.debug('Creating company merchant:', {
        companyName: args.companyName,
      });
      return await this.makeRequest<IMerchantResponse>({
        method: 'POST',
        path: meta.paths.company,
        data: {
          ...args,
          register_number: args.registerNumber,
          mcc_code: args.mccCode,
          company_name: args.companyName,
        },
      });
    } catch (error: any) {
      console.debug('Error creating company:', error);
      if (
        error.message?.includes('MERCHANT_ALREADY_REGISTERED') ||
        error.message?.includes('Бүртгэлтэй мерчант байна')
      ) {
        console.debug(
          'Merchant already registered, updating existing merchant',
        );
        return await this.updateExistingMerchant({
          ...args,
          company_name: args.companyName,
          name: args.name,
        });
      }

      throw error;
    }
  }

  async updateCompany(args: IMerchantCompanyParams) {
    console.debug('Updating company merchant:', {
      companyName: args.companyName,
    });
    return await this.makeRequest<IMerchantResponse>({
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
      console.debug('Creating customer merchant:', {
        businessName: args.businessName,
      });
      const res = await this.makeRequest<IMerchantResponse>({
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
      console.debug('Customer merchant response:', res);
      return res;
    } catch (error: any) {
      console.debug('Error creating customer:', error);
      if (
        error.message?.includes('MERCHANT_ALREADY_REGISTERED') ||
        error.message?.includes('Бүртгэлтэй мерчант байна')
      ) {
        console.debug(
          'Merchant already registered, updating existing merchant',
        );
        return await this.updateExistingMerchant({
          ...args,
          first_name: args.firstName,
          last_name: args.lastName,
        });
      }

      throw error;
    }
  }

  async updateCustomer(args: IMerchantCustomerParams) {
    console.debug('Updating customer merchant:', {
      businessName: args.businessName,
    });
    return await this.makeRequest<IMerchantResponse>({
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
      console.debug('Removing merchant:', {
        merchantId: this.config.merchantId,
      });
      return await this.makeRequest<IMerchantResponse>({
        method: 'DELETE',
        path: `${meta.paths.getMerchant}/${this.config.merchantId}`,
      });
    } catch (e) {
      if (e.message.includes('MERCHANT_NOTFOUND')) {
        console.debug('Merchant not found, skipping removal');
        return;
      }
      throw new Error(e.message);
    }
  }

  async updateExistingMerchant(args: any) {
    console.debug('Updating existing merchant:', {
      registerNumber: args.registerNumber,
    });

    const existingMerchant = await this.findExistingMerchant(
      args.registerNumber,
    );
    const path =
      existingMerchant?.type === 'COMPANY'
        ? meta.paths.company
        : meta.paths.person;
    if (existingMerchant) {
      return this.makeRequest<IMerchantResponse>({
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

  async createInvoice(invoice: ITransactionDocument) {
    console.debug('Creating invoice:', { amount: invoice.amount });
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
      console.debug('Checking invoice status:', {
        invoiceId: invoice.response?.id,
      });
      const res = await this.makeRequest<IInvoiceResponse>({
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
    try {
      console.debug('Manually checking invoice status:', {
        invoiceId: invoice.response?.id,
      });
      const res = await this.makeRequest<IInvoiceResponse>({
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
    console.debug('Getting merchant details:', { merchantId: _id });
    return await this.makeRequest<IMerchantResponse>({
      method: 'GET',
      path: `${meta.paths.getMerchant}/${_id}`,
    });
  }

  async list() {
    console.debug('Listing merchants');
    return await this.makeRequest<IMerchantResponse>({
      method: 'POST',
      path: meta.paths.merchantList,
      data: {
        offset: {
          page_number: 1,
          page_limit: 20,
        },
      },
    });
  }

  async findExistingMerchant(registerNumber: string): Promise<any | null> {
    let pageNumber = 1;
    const pageLimit = 20;

    while (true) {
      console.debug(`Fetching merchants - Page: ${pageNumber}`);
      const list = await this.makeRequest<IMerchantResponse>({
        method: 'POST',
        path: meta.paths.merchantList,
        data: {
          offset: {
            page_number: pageNumber,
            page_limit: pageLimit,
          },
        },
      });

      const found = list.rows?.find(
        (item) => item.register_number === registerNumber,
      );

      if (found) {
        return found;
      }

      // Stop if we’ve reached the end
      if (!list.rows || list.rows.length < pageLimit) {
        break;
      }

      pageNumber++;
    }

    return null;
  }

  async getDistricts(city: string) {
    console.debug('Getting districts:', { city });
    return await this.makeRequest<{ districts: string[] }>({
      method: 'GET',
      path: `${meta.paths.districts}/${city}`,
    });
  }
}
