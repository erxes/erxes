import { IContext } from '~/connectionResolvers';
import { PAYMENTS } from '~/constants';
import { getEnv } from 'erxes-api-shared/utils';
import { QPayQuickQrAPI } from '~/apis/qpayQuickqr/api';
import { PocketAPI } from '~/apis/pocket/api';
import { StripeAPI } from '~/apis/stripe/api';
import ErxesPayment from '~/apis/ErxesPayment';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';
import { extractErrorMessage } from '~/utils/extractErrorMessage';

function resolveDomain(subdomain: string) {
  const DOMAIN = getEnv({ name: 'DOMAIN' })
    ? `${getEnv({ name: 'DOMAIN' })}/gateway`
    : 'http://localhost:4000';

  return DOMAIN.replace('<subdomain>', subdomain);
}

function validatePaymentKind(kind: string) {
  const paymentConfig = PAYMENTS[kind];

  if (!paymentConfig || Array.isArray(paymentConfig)) {
    throw new Error(`Unsupported payment kind: ${kind}`);
  }

  return paymentConfig;
}

async function handleQPaySetup(input: any) {
  if (input.kind !== 'qpayQuickqr') return;

  if (input.config?.type) {
    input.config.isCompany = input.config.type === 'company';
    delete input.config.type;
  }

  const api = new QPayQuickQrAPI(input.config);
  const { isCompany } = input.config;

  const response = isCompany
    ? await api.createCompany(input.config)
    : await api.createCustomer(input.config);

  if (!response?.id) {
    throw new Error(
      `QPay did not return merchant id: ${JSON.stringify(response)}`,
    );
  }

  input.config.merchantId = response.id;
}

async function authorizePayment(
  payment: any,
  models: any,
  subdomain: string,
) {
  const api = new ErxesPayment(payment, subdomain);

  try {
    await api.authorize(payment);
  } catch (e: any) {
    await models.PaymentMethods.removePayment(payment._id);
    throw new Error(extractErrorMessage(e));
  }
}

async function registerWebhookIfNeeded(
  input: any,
  payment: any,
  domain: string,
  models: any,
) {
  try {
    if (input.kind === 'pocket') {
      const api = new PocketAPI(input.config, domain);
      await api.registerWebhook(payment._id);
    }

    if (input.kind === 'stripe') {
      const api = new StripeAPI(input.config, domain);
      await api.registerWebhook(payment._id);
    }
  } catch (e: any) {
    await models.PaymentMethods.removePayment(payment._id);
    throw new Error(extractErrorMessage(e));
  }
}

const mutations = {
  async paymentAdd(
    _root: any,
    args: any,
    { models, subdomain }: IContext,
  ) {
    const { input } = args;

    if (!input?.kind) {
      throw new Error('Payment kind is required');
    }

    const paymentConfig = validatePaymentKind(input.kind);

    const domain = resolveDomain(subdomain);

    input.acceptedCurrencies = input.config?.currency
      ? [input.config.currency]
      : paymentConfig.acceptedCurrencies;

    try {
      await handleQPaySetup(input);
    } catch (e: any) {
      throw new Error(extractErrorMessage(e));
    }

    const payment = await models.PaymentMethods.createPayment(input);

    // 1️⃣ Authorize first (multi-tenant safe)
    await authorizePayment(payment, models, subdomain);

    // 2️⃣ Register webhook only after successful authorization
    await registerWebhookIfNeeded(input, payment, domain, models);

    return payment;
  },

  async paymentRemove(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    await models.PaymentMethods.removePayment(_id);
    return 'success';
  },

  async paymentEdit(
    _root: any,
    args: any,
    { models }: IContext,
  ) {
    const { _id, input } = args;
    const { name, status, kind, config, currency } = input;

    const paymentConfig = validatePaymentKind(kind);

    if (kind === 'qpayQuickqr') {
      try {
        if (config?.type) {
          config.isCompany = config.type === 'company';
          delete config.type;
        }

        const api = new QPayQuickQrAPI(config);
        const { isCompany } = config;

        const response = isCompany
          ? await api.updateCompany(config)
          : await api.updateCustomer(config);

        if (!response?.id) {
          throw new Error('QPay update did not return merchant id');
        }

        config.merchantId = response.id;
      } catch (e: any) {
        throw new Error(extractErrorMessage(e));
      }
    }

    const doc: any = {
      name,
      status,
      kind,
      config,
      acceptedCurrencies: currency
        ? [currency]
        : paymentConfig.acceptedCurrencies,
    };

    return await models.PaymentMethods.updatePayment(_id, doc);
  },
};


requireLogin(mutations, 'paymentAdd');
requireLogin(mutations, 'paymentEdit');
requireLogin(mutations, 'paymentRemove');

checkPermission(mutations, 'paymentAdd', 'paymentAdd', []);
checkPermission(mutations, 'paymentEdit', 'paymentEdit', []);
checkPermission(mutations, 'paymentRemove', 'paymentRemove', []);

export default mutations;
