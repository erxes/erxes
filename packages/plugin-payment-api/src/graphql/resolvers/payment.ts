import { IPayment } from '../../models/definitions/payments';

export default {
  async config(payment: IPayment) {
    const config: any = payment.config;

    switch (payment.kind) {
      case 'qpay':
        config.qpayMerchantPassword = '';
        break;
      case 'socialpay':
        config.inStoreSPKey = '';
        break;
      case 'monpay':
        config.accountId = '';
        break;
      case 'pocket':
        config.pocketClientSecret = '';
        break;
      case 'minupay':
        config.password = '';
        break;
      case 'golomt':
        config.token = '';
        break;
      default:
        return config;
    }

    return config;
  },
};
