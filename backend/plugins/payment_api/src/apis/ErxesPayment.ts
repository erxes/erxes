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

function extractErrorMessage(e: any): string {
  if (!e) return 'Unknown error';

  if (typeof e === 'string') return e;

  if (e.message) return e.message;

  if (e.response?.data?.message) return e.response.data.message;

  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

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

  private payment: IPaymentDocument;

  constructor(payment: IPaymentDocument, subdomain?: string) {
    this.payment = payment;
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';

    this.domain = DOMAIN.replace('<subdomain>', subdomain || '');

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

  async authorize(payment: IPaymentDocument) {
    const api = (this as any)[payment.kind];

    if (api?.authorize) {
      try {
        return await api.authorize(payment);
      } catch (e: any) {
        console.error('Authorize error:', e);
        throw new Error(extractErrorMessage(e));
      }
    }

    return { success: true, message: 'Authorized' };
  }

  async createInvoice(transaction: ITransactionDocument) {
    const api = (this as any)[this.payment.kind];

    try {
      return await api.createInvoice(transaction, this.payment);
    } catch (e: any) {
      console.error('Create invoice error:', e);
      return { error: extractErrorMessage(e) };
    }
  }

  async checkInvoice(invoice: ITransactionDocument) {
    const api = (this as any)[this.payment.kind];

    try {
      return await api.checkInvoice(invoice);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async manualCheck(invoice: ITransactionDocument) {
    const api = (this as any)[this.payment.kind];

    try {
      return await api.manualCheck(invoice);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }

  async cancelInvoice(invoice: ITransactionDocument) {
    const api = (this as any)[this.payment.kind];

    try {
      return api.cancelInvoice && (await api.cancelInvoice(invoice));
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }
  }
}

export default ErxesPayment;
