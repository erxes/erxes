import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types/deal';
import { subscriptionWrapper } from '~/modules/sales/graphql/resolvers/utils';
import { sendDealBarcodeEmail } from '~/modules/sales/meta/payments/sendDealBarcodeEmail';

const getString = (
  data: Record<string, any>,
  key: string,
): string | undefined => {
  const value = data?.[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  const stringValue = String(value).trim();

  return stringValue || undefined;
};

const resolveUserId = async (
  subdomain: string,
  data: Record<string, any>,
): Promise<string | undefined> => {
  const fromData = getString(data, 'createdBy') || getString(data, 'userId');
  if (fromData) return fromData;

  const owners: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: { query: { isOwner: true } },
    defaultValue: [],
  });

  return owners?.length ? String(owners[0]._id) : undefined;
};

const buildDealDoc = (invoice: Record<string, any>, stageId: string): IDeal => {
  const data =
    invoice?.data && typeof invoice.data === 'object' ? invoice.data : {};

  const name =
    getString(data, 'name') ||
    getString(invoice, 'description') ||
    (invoice.invoiceNumber ? `Deal – ${invoice.invoiceNumber}` : undefined);

  if (!name) {
    throw new Error('Deal name is required (invoice.data.name)');
  }

  return {
    name,
    stageId,
    description: getString(data, 'description'),
    assignedUserIds: getString(data, 'assigneeId')
      ? [getString(data, 'assigneeId') as string]
      : undefined,
  };
};

export const handleCreateDealFromPayment = async (
  subdomain: string,
  data: Record<string, any>,
) => {
  const dealConfig =
    data?.dealConfig && typeof data.dealConfig === 'object'
      ? data.dealConfig
      : {};

  const stageId = getString(dealConfig, 'stageId');

  if (!stageId) {
    throw new Error(
      'Deal payment callback requires a stage (payment method dealConfig.stageId)',
    );
  }

  const models = await generateModels(subdomain);

  const existing = await models.Deals.findOne({
    sourceInvoiceId: data._id,
  }).lean();

  if (existing) {
    return existing;
  }

  const userId = await resolveUserId(subdomain, data);

  if (!userId) {
    throw new Error(
      'Deal payment callback requires a user (invoice.data.createdBy or an owner user)',
    );
  }

  const doc = buildDealDoc(data, stageId);

  const deal = await models.Deals.createDeal({
    ...doc,
    userId,
    sourceInvoiceId: data._id,
  });

  await subscriptionWrapper(models, { action: 'create', deal });

  const shouldSendEmail =
    typeof data.sendBarcodeEmail === 'boolean'
      ? data.sendBarcodeEmail
      : data.sendEmailOnPayment !== false;

  if (shouldSendEmail && data.email) {
    await sendDealBarcodeEmail(subdomain, {
      email: data.email,
      code: data.invoiceNumber || data._id,
      title: deal.name || 'Deal',
      amount: data.amount,
      currency: data.currency,
    }).catch(() => undefined);
  }

  return deal;
};
