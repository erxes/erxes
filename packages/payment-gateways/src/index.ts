import { golomtDriver } from './golomt';
import { hipayDriver } from './hipay';
import { monpayDriver } from './monpay';
import { paypalDriver } from './paypal';
import { pocketDriver } from './pocket';
import { qpayDriver } from './qpay';
import { socialpayDriver } from './socialpay';
import { storepayDriver } from './storepay';
import { stripeDriver } from './stripe';
import { tdbDriver } from './tdb';
import { testDriver } from './test';
import { tokiDriver } from './toki';
import { wechatpayDriver } from './wechatpay';
import type { DriverOptions, GatewayConfig, GatewayDriver } from './types';

export * from './types';

/**
 * The driver for a gateway connection:
 *
 *   const gateway = createGateway({ kind: 'qpay', clientId, clientSecret, invoiceCode, sandbox: false }, { cacheKey: connectionId });
 *   const { gatewayInvoiceId, payment, state } = await gateway.createInvoice({ invoiceId, amount: 150000, currency: 'MNT', description, callbackUrl });
 *   const { paid, paymentId } = await gateway.check(gatewayInvoiceId, 150000, state ?? {});
 */
export const createGateway = (
  config: GatewayConfig,
  options: DriverOptions = {},
): GatewayDriver => {
  switch (config.kind) {
    case 'qpay':
      return qpayDriver(config, options);
    case 'socialpay':
      return socialpayDriver(config, options);
    case 'monpay':
      return monpayDriver(config, options);
    case 'storepay':
      return storepayDriver(config, options);
    case 'pocket':
      return pocketDriver(config, options);
    case 'toki':
      return tokiDriver(config, options);
    case 'golomt':
      return golomtDriver(config, options);
    case 'tdb':
      return tdbDriver(config, options);
    case 'hipay':
      return hipayDriver(config, options);
    case 'stripe':
      return stripeDriver(config, options);
    case 'paypal':
      return paypalDriver(config, options);
    case 'wechatpay':
      return wechatpayDriver(config, options);
    case 'test':
      return testDriver();
  }
};
