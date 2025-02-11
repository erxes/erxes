import { IPaymentDocument } from '../models/definitions/payments';
import { MonpayAPI } from './monpay/api';
import { PaypalAPI } from './paypal/api';
import { QpayAPI } from './qpay/api';
import { QPayQuickQrAPI } from './qpayQuickqr/api';
import { SocialPayAPI } from './socialpay/api';
import { StorePayAPI } from './storepay/api';
import { WechatPayAPI } from './wechatpay/api';
import { PocketAPI } from './pocket/api';
import { ITransactionDocument } from '../models/definitions/transactions';
import { MinuPayAPI } from './minupay/api';
import { GolomtAPI } from './golomt/api';
import { StripeAPI } from './stripe/api';
import { KhanbankAPI } from './khanbank/api';
import { getEnv } from '@erxes/api-utils/src/core';

class ErxesPayment {
  public socialpay!: SocialPayAPI;
  public storepay!: StorePayAPI;
  public qpay!: QpayAPI;
  public monpay!: MonpayAPI;
  public paypal!: PaypalAPI;
  public wechatpay!: WechatPayAPI;
  public qpayQuickqr!: QPayQuickQrAPI;
  public pocket!: PocketAPI;
  public minupay!: MinuPayAPI;
  public golomt!: GolomtAPI;
  public stripe!: StripeAPI;
  public khanbank!: KhanbankAPI;
  public domain: string;

  private payment: any;

  constructor(payment: IPaymentDocument, subdomain?: string) {
    this.payment = payment;
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';
    const apiDomain = DOMAIN.replace('<subdomain>', subdomain || '');
    this.domain = apiDomain;

    switch (payment.kind) {
      case 'socialpay':
        this.socialpay = new SocialPayAPI(payment.config);
        break;
      case 'storepay':
        this.storepay = new StorePayAPI(payment.config, this.domain);
        break;
      case 'qpay':
        this.qpay = new QpayAPI(
          { ...payment.config, branchCode: payment.name },
          this.domain
        );
        break;
      case 'monpay':
        this.monpay = new MonpayAPI(payment.config, this.domain);
        break;
      case 'paypal':
        this.paypal = new PaypalAPI(payment.config);
        break;
      case 'wechatpay':
        this.wechatpay = new WechatPayAPI(payment.config, this.domain);
        break;
      case 'qpayQuickqr':
        this.qpayQuickqr = new QPayQuickQrAPI(payment.config, this.domain);
        break;
      case 'pocket':
        this.pocket = new PocketAPI(payment.config, this.domain);
        break;
      case 'minupay':
        this.minupay = new MinuPayAPI(payment.config, this.domain);
        break;
      case 'golomt':
        this.golomt = new GolomtAPI(payment.config, this.domain);
        break;
      case 'stripe':
        this.stripe = new StripeAPI(payment.config, this.domain);
        break;
      case 'khanbank':
        this.khanbank = new KhanbankAPI(payment.config, subdomain || '');
        break;
      default:
        break;
    }
  }

  async createInvoice(transaction: ITransactionDocument) {
    const { payment } = this;
    const details = transaction.details || {};

    // return { qrData: await QRCode.toDataURL('test') };

    const api = this[payment.kind];

    if (details.monpayCoupon) {
      const amount = transaction.amount - details.monpayCoupon;

      transaction.amount = amount > 0 ? amount : 0;
    }

    try {
      return await api.createInvoice(transaction, payment);
    } catch (e) {
      return { error: e.message };
    }
  }

  async checkInvoice(invoice: ITransactionDocument) {
    const { payment } = this;

    const api = this[payment.kind];

    try {
      return await api.checkInvoice(invoice);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    const { payment } = this;

    const api = this[payment.kind];

    try {
      return await api.manualCheck(invoice);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    const { payment } = this;

    const api = this[payment.kind];

    try {
      return api.cancelInvoice && (await api.cancelInvoice(invoice));
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default ErxesPayment;
