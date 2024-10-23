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

class ErxesPayment {
  public socialpay: SocialPayAPI;
  public storepay: StorePayAPI;
  public qpay: QpayAPI;
  public monpay: MonpayAPI;
  public paypal: PaypalAPI;
  public wechatpay: WechatPayAPI;
  public qpayQuickqr: QPayQuickQrAPI;
  public pocket: PocketAPI;
  public minupay: MinuPayAPI;
  public golomt: GolomtAPI;
  public stripe: StripeAPI;
  public domain: string;

  private payment: any;

  constructor(payment: IPaymentDocument, domain?: string) {
    this.payment = payment;
    this.domain = domain || '';
    this.socialpay = new SocialPayAPI(payment.config);
    this.storepay = new StorePayAPI(payment.config, domain);
    this.qpay = new QpayAPI(payment.config, domain);
    this.monpay = new MonpayAPI(payment.config, domain);
    this.paypal = new PaypalAPI(payment.config);
    this.wechatpay = new WechatPayAPI(payment.config, domain);
    this.qpayQuickqr = new QPayQuickQrAPI(payment.config, domain);
    this.pocket = new PocketAPI(payment.config, domain);
    this.minupay = new MinuPayAPI(payment.config, domain);
    this.golomt = new GolomtAPI(payment.config, domain);
    this.stripe = new StripeAPI(payment.config, domain);
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
