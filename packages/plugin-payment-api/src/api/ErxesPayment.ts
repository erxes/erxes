import { IInvoiceDocument } from '../models/definitions/invoices';
import { IPaymentDocument } from '../models/definitions/payments';
import { MonpayAPI } from './monpay/api';
import { PaypalAPI } from './paypal/api';
import { QpayAPI } from './qpay/api';
import { QPayQuickQrAPI } from './qpayQuickqr/api';
import { SocialPayAPI } from './socialpay/api';
import { StorePayAPI } from './storepay/api';
import { WechatPayAPI } from './wechatpay/api';

class ErxesPayment {
  public socialpay: SocialPayAPI;
  public storepay: StorePayAPI;
  public qpay: QpayAPI;
  public monpay: MonpayAPI;
  public paypal: PaypalAPI;
  public wechatpay: WechatPayAPI;
  public qpayQuickqr: QPayQuickQrAPI;
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
  }

  async createInvoice(invoice: IInvoiceDocument) {
    const { payment } = this;
    const api = this[payment.kind];

    try {
      return await api.createInvoice(invoice, payment);
    } catch (e) {
      return { error: e.message };
    }
  }

  async checkInvoice(invoice: IInvoiceDocument) {
    const { payment } = this;

    const api = this[payment.kind];

    try {
      return await api.checkInvoice(invoice);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async cancelInvoice(invoice: IInvoiceDocument) {
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
