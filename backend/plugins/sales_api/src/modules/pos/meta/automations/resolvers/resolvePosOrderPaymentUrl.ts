import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

type TPosOrderPaymentSource = {
  _id?: string;
  targetId?: string;
  customerId?: string;
  customerType?: string;
  finalAmount?: number;
  number?: string;
  posId?: string;
  posToken?: string;
  totalAmount?: number;
};

type TPosPaymentSource = {
  paymentIds?: string[];
  token?: string;
};

type TPosOrderPaymentUrlDependencies = {
  generateInvoiceUrl: (input: {
    amount: number;
    currency: string;
    customerId?: string;
    customerType?: string;
    data: { posToken: string };
    description: string;
    contentType: string;
    contentTypeId: string;
    paymentIds: string[];
  }) => Promise<unknown>;
  getOrder: (orderId: string) => Promise<TPosOrderPaymentSource | null>;
  getPos: (posId: string) => Promise<TPosPaymentSource | null>;
};

const getOrderAmount = (order: TPosOrderPaymentSource) =>
  order.finalAmount || order.totalAmount || 0;

const getPaymentUrl = (result: unknown) => {
  if (!result || typeof result !== 'object' || !('url' in result)) {
    return '';
  }

  return typeof result.url === 'string' ? result.url : '';
};

export const resolvePosOrderPaymentUrlWithDependencies = async ({
  dependencies,
  source,
}: {
  dependencies: TPosOrderPaymentUrlDependencies;
  source: TPosOrderPaymentSource;
}) => {
  const orderId = source.targetId || source._id;

  if (!orderId) {
    return '';
  }

  const order = getOrderAmount(source)
    ? source
    : await dependencies.getOrder(orderId);

  if (!order?.posId) {
    return '';
  }

  const pos = await dependencies.getPos(order.posId);
  const paymentIds = pos?.paymentIds || [];
  const posToken = order.posToken || pos?.token;
  const amount = getOrderAmount(order);

  if (!paymentIds.length || !posToken || amount <= 0) {
    return '';
  }

  const result = await dependencies.generateInvoiceUrl({
    amount,
    currency: 'MNT',
    description: `POS order ${order.number || orderId}`,
    customerId: order.customerId,
    customerType: order.customerType,
    contentType: 'sales:pos.orders',
    contentTypeId: orderId,
    data: { posToken },
    paymentIds,
  });

  return getPaymentUrl(result);
};

export const resolvePosOrderPaymentUrl = async ({
  source,
  subdomain,
}: {
  source: TPosOrderPaymentSource;
  subdomain: string;
}) => {
  const models = await generateModels(subdomain);

  return await resolvePosOrderPaymentUrlWithDependencies({
    source,
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
