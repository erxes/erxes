import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

type TPosOrderPaymentSource = {
  _id: string;
  customerId?: string;
  customerType?: string;
  finalAmount?: number;
  number: string;
  posId?: string;
  totalAmount?: number;
};

type TPosPaymentSource = {
  paymentIds?: string[];
};

type TPosOrderPaymentUrlDependencies = {
  generateInvoiceUrl: (input: {
    amount: number;
    currency: string;
    customerId?: string;
    customerType?: string;
    description: string;
    contentType: string;
    contentTypeId: string;
    paymentIds: string[];
  }) => Promise<unknown>;
  getOrder: (orderId: string) => Promise<TPosOrderPaymentSource | null>;
  getPos: (posId: string) => Promise<TPosPaymentSource | null>;
};

const getPaymentUrl = (result: unknown) => {
  if (!result || typeof result !== 'object' || !('url' in result)) {
    return '';
  }

  return typeof result.url === 'string' ? result.url : '';
};

export const resolvePosOrderPaymentUrlWithDependencies = async ({
  dependencies,
  orderId,
}: {
  dependencies: TPosOrderPaymentUrlDependencies;
  orderId: string;
}) => {
  if (!orderId) {
    return '';
  }

  const order = await dependencies.getOrder(orderId);

  if (!order?.posId) {
    return '';
  }

  const pos = await dependencies.getPos(order.posId);
  const paymentIds = pos?.paymentIds || [];
  const amount = order.finalAmount || order.totalAmount || 0;

  if (!paymentIds.length || amount <= 0) {
    return '';
  }

  const result = await dependencies.generateInvoiceUrl({
    amount,
    currency: 'MNT',
    description: `POS order ${order.number}`,
    customerId: order.customerId,
    customerType: order.customerType,
    contentType: 'sales:pos.orders',
    contentTypeId: order._id,
    paymentIds,
  });

  return getPaymentUrl(result);
};

export const resolvePosOrderPaymentUrl = async ({
  orderId,
  subdomain,
}: {
  orderId: string;
  subdomain: string;
}) => {
  const models = await generateModels(subdomain);

  return await resolvePosOrderPaymentUrlWithDependencies({
    orderId,
    dependencies: {
      getOrder: (id) => models.PosOrders.findOne({ _id: id }).lean(),
      getPos: (id) => models.Pos.findOne({ _id: id }).lean(),
      generateInvoiceUrl: (input) =>
        sendTRPCMessage({
          subdomain,
          pluginName: 'payment',
          method: 'mutation',
          module: 'payment',
          action: 'getOrCreateInvoiceUrl',
          input,
          defaultValue: null,
        }),
    },
  });
};
