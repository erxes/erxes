import { qpayDriver } from './qpay';
import { testDriver } from './test';
import type { DriverOptions, GatewayConfig, GatewayDriver } from './types';

export * from './types';

export { qpayDriver } from './qpay';

export { testDriver } from './test';

/**
 * The driver for a gateway connection:
 *
 *   const gateway = createGateway({ kind: 'qpay', clientId, clientSecret, invoiceCode, sandbox: false }, { cacheKey: connectionId });
 *   const { gatewayInvoiceId, payment } = await gateway.createInvoice({ invoiceId, amount: 150000, currency: 'MNT', description, callbackUrl });
 *   const { paid, paymentId } = await gateway.check(gatewayInvoiceId, 150000, {});
 */
export const createGateway = (config: GatewayConfig, options: DriverOptions = {}): GatewayDriver =>
  config.kind === 'qpay' ? qpayDriver(config, options) : testDriver();

/** What refunds each gateway can make itself (without credentials at hand). */
export const GATEWAY_REFUNDS: Record<GatewayConfig['kind'], GatewayDriver['refunds']> = {
  qpay: 'full',
  test: 'partial',
};
