import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

// A Create deal result (targetId) or a deal from a trigger (_id).
type TDealPaymentSource = object;

const readDealId = (source: TDealPaymentSource) => {
  const { targetId, _id } = source as { targetId?: unknown; _id?: unknown };
  const id = targetId || _id;

  return typeof id === 'string' ? id : '';
};

type TDealForPayment = {
  _id: string;
  name?: string;
  number?: string;
  stageId?: string;
  totalAmount?: number;
  mobileAmount?: number;
  customerId?: string | null;
  productsData?: { currency?: string; tickUsed?: boolean }[];
};

type TDealPaymentUrlDependencies = {
  getDeal: (dealId: string) => Promise<TDealForPayment | null>;
  getPaymentIds: (stageId: string) => Promise<string[]>;
  generateInvoiceUrl: (input: {
    amount: number;
    currency: string;
    description: string;
    customerId?: string;
    customerType?: string;
    contentType: string;
    contentTypeId: string;
    paymentIds: string[];
  }) => Promise<unknown>;
};

const getPaymentUrl = (result: unknown) =>
  result &&
  typeof result === 'object' &&
  'url' in result &&
  typeof result.url === 'string'
    ? result.url
    : '';

/**
 * A payment link for what is still owed on a deal: its total less what has
 * already come in online. Empty when nothing is owed or the deal's pipeline
 * has no online payment configured. Paying it lands in the existing
 * `sales:deal` payment callback, which adds to `mobileAmounts`.
 */
export const resolveDealPaymentUrlWithDependencies = async ({
  dependencies,
  source,
}: {
  dependencies: TDealPaymentUrlDependencies;
  source: TDealPaymentSource;
}) => {
  const dealId = readDealId(source);

  if (!dealId) {
    return '';
  }

  // Always read the deal: a link must reflect payments made since the run began.
  const deal = await dependencies.getDeal(dealId);

  if (!deal?.stageId) {
    return '';
  }

  const owed = (deal.totalAmount || 0) - (deal.mobileAmount || 0);
  const paymentIds = owed > 0 ? await dependencies.getPaymentIds(deal.stageId) : [];

  if (owed <= 0 || !paymentIds.length) {
    return '';
  }

  const currency =
    (deal.productsData || []).find((product) => product.tickUsed && product.currency)
      ?.currency || 'MNT';

  const result = await dependencies.generateInvoiceUrl({
    amount: owed,
    currency,
    description: `Deal ${deal.number || deal.name || dealId}`,
    ...(deal.customerId
      ? { customerId: deal.customerId, customerType: 'customer' }
      : {}),
    contentType: 'sales:deal',
    contentTypeId: dealId,
    paymentIds,
  });

  return getPaymentUrl(result);
};

export const resolveDealPaymentUrl = async ({
  source,
  subdomain,
}: {
  source: TDealPaymentSource;
  subdomain: string;
}) => {
  const models = await generateModels(subdomain);

  return await resolveDealPaymentUrlWithDependencies({
    source,
    dependencies: {
      getDeal: (id) => models.Deals.findOne({ _id: id }).lean(),
      getPaymentIds: async (stageId) => {
        const stage = await models.Stages.findOne({ _id: stageId }).lean();
        const pipeline = stage
          ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
          : null;

        return pipeline?.paymentIds || [];
      },
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
