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
          this.domain,
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

  async authorize(payment: IPaymentDocument) {
    const api = this[payment.kind];

    if (api.authorize) {
      try {
        return await api.authorize(payment);
      } catch (e) {
        throw new Error(e.message);
      }
    }

    return { success: true, message: 'Authorized' };
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
