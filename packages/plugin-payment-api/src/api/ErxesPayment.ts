import { IInvoiceDocument } from '../models/definitions/invoices';
import { IPaymentDocument } from '../models/definitions/payments';
import { MonpayAPI } from './monpay/api';
import { QpayAPI } from './qpay/api';
import { SocialPayAPI } from './socialpay/api';
import { StorePayAPI } from './storepay/api';

class ErxesPayment {
  public socialpay: SocialPayAPI;
  public storepay: StorePayAPI;
  public qpay: QpayAPI;
  public monpay: MonpayAPI;

  private payment: any;

  constructor(payment: IPaymentDocument) {
    this.payment = payment;
    this.socialpay = new SocialPayAPI(payment.config);
    this.storepay = new StorePayAPI(payment.config);
    this.qpay = new QpayAPI(payment.config);
    this.monpay = new MonpayAPI(payment.config);
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
