import { getEnv } from 'erxes-api-shared/utils';
import { GolomtAPI } from '~/apis/golomt/api';
import { KhanbankAPI } from '~/apis/khanbank/api';
import { MinuPayAPI } from '~/apis/minupay/api';
import { MonpayAPI } from '~/apis/monpay/api';
import { PaypalAPI } from '~/apis/paypal/api';
import { PocketAPI } from '~/apis/pocket/api';
import { QpayAPI } from '~/apis/qpay/api';
import { QPayQuickQrAPI } from '~/apis/qpayQuickqr/api';
import { SocialPayAPI } from '~/apis/socialpay/api';
import { StorePayAPI } from '~/apis/storepay/api';
import { StripeAPI } from '~/apis/stripe/api';
import { WechatPayAPI } from '~/apis/wechatpay/api';
import { IPaymentDocument } from '~/modules/payment/@types/payment';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';
import { extractErrorMessage } from '~/utils/extractErrorMessage';

class ErxesPayment {
  public readonly domain: string;
  private readonly payment: IPaymentDocument;
  private readonly api: any;

  constructor(payment: IPaymentDocument, subdomain?: string) {
    this.payment = payment;

    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';

    this.domain = DOMAIN.replace('<subdomain>', subdomain || '');

    switch (payment.kind) {
      case 'socialpay':
        this.api = new SocialPayAPI(payment.config);
        break;
      case 'storepay':
        this.api = new StorePayAPI(payment.config, this.domain);
        break;
      case 'qpay':
        this.api = new QpayAPI(
          { ...payment.config, branchCode: payment.name },
          this.domain,
        );
        break;
      case 'monpay':
        this.api = new MonpayAPI(payment.config, this.domain);
        break;
      case 'paypal':
        this.api = new PaypalAPI(payment.config);
        break;
      case 'wechatpay':
        this.api = new WechatPayAPI(payment.config, this.domain);
        break;
      case 'qpayQuickqr':
        this.api = new QPayQuickQrAPI(payment.config, this.domain);
        break;
      case 'pocket':
        this.api = new PocketAPI(payment.config, this.domain);
        break;
      case 'minupay':
        this.api = new MinuPayAPI(payment.config, this.domain);
        break;
      case 'golomt':
        this.api = new GolomtAPI(payment.config, this.domain);
        break;
      case 'stripe':
        this.api = new StripeAPI(payment.config, this.domain);
        break;
      case 'khanbank':
        this.api = new KhanbankAPI(payment.config, subdomain || '');
        break;
      default:
        this.api = null;
        break;
    }
  }

  async authorize(payment: IPaymentDocument) {
    if (!this.api?.authorize) {
      return { success: true, message: 'Authorized' };
    }

    try {
      return await this.api.authorize(payment);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    if (!this.api?.createInvoice) {
      return {
        error: `Payment kind "${this.payment.kind}" does not support createInvoice`,
      };
    }

    const details = transaction.details || {};

    const invoiceAmount = details.monpayCoupon
      ? Math.max(transaction.amount - details.monpayCoupon, 0)
      : transaction.amount;

    // clone transaction safely instead of mutating
    const invoicePayload = {
      ...transaction,
      amount: invoiceAmount,
    };

    try {
      return await this.api.createInvoice(invoicePayload, this.payment);
    } catch (e: any) {
      return { error: extractErrorMessage(e) };
    }
  }

  async checkInvoice(invoice: ITransactionDocument) {
    if (!this.api?.checkInvoice) {
      throw new Error(
        `Payment kind "${this.payment.kind}" does not support checkInvoice`,
      );
    }

    try {
      return await this.api.checkInvoice(invoice);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    if (!this.api?.manualCheck) {
      throw new Error(
        `Payment kind "${this.payment.kind}" does not support manualCheck`,
      );
    }

    try {
      return await this.api.manualCheck(invoice);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    if (!this.api?.cancelInvoice) {
      throw new Error(
        `Payment kind "${this.payment.kind}" does not support cancelInvoice`,
      );
    }

    try {
      return await this.api.cancelInvoice(invoice);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }
}

export default ErxesPayment;
