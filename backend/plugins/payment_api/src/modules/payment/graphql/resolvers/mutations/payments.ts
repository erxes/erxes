import { IPayment } from '~/modules/payment/@types/payment';
import { IContext } from '~/connectionResolvers';
import { PAYMENTS } from '~/constants';
import { getEnv } from 'erxes-api-shared/utils';
import { QPayQuickQrAPI } from '~/apis/qpayQuickqr/api';
import { PocketAPI } from '~/apis/pocket/api';
import { StripeAPI } from '~/apis/stripe/api';
import ErxesPayment from '~/apis/ErxesPayment';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';

const mutations = {
  async paymentAdd(
    _root,
    args: any & { currency?: string },
    { models, subdomain }: IContext,
  ) {
    const { input } = args;
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    const acceptedCurrencies = PAYMENTS[input.kind].acceptedCurrencies;
    input.acceptedCurrencies = acceptedCurrencies;

    if (input.config?.currency) {
      input.acceptedCurrencies = [input.config.currency];
    }

    if (input.kind === 'qpayQuickqr') {
      const api = new QPayQuickQrAPI(input.config);
      const { isCompany } = input.config;

      let apiResponse;
      try {
        if (isCompany) {
          apiResponse = await api.createCompany(input.config);
        } else {
          apiResponse = await api.createCustomer(input.config);
        }

        const { id } = apiResponse;

        input.config.merchantId = id;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    const payment = await models.PaymentMethods.createPayment(input);

    if (input.kind === 'pocket') {
      const pocketApi = new PocketAPI(input.config, domain);
      try {
        await pocketApi.registerWebhook(payment._id);
      } catch (e) {
        await models.PaymentMethods.removePayment(payment._id);
        throw new Error(`Error while registering pocket webhook: ${e.message}`);
      }
    }

    if (input.kind === 'stripe') {
      const stripeApi = new StripeAPI(input.config, domain);
      try {
        await stripeApi.registerWebhook(payment._id);
      } catch (e) {
        await models.PaymentMethods.removePayment(payment._id);
        throw new Error(`Error while registering stripe webhook: ${e.message}`);
      }
    }

    const api = new ErxesPayment(payment);

    try {
      await api.authorize(payment);
    } catch (e) {
      await models.PaymentMethods.removePayment(payment._id);
      throw new Error(`Error while authorizing payment: ${e.message}`);
    }

    return payment;
  },

  async paymentRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    await models.PaymentMethods.removePayment(_id);

    return 'success';
  },

  async paymentEdit(_root, args: any, { models }: IContext) {
    const { _id, input } = args;
    const { name, status, kind, config, currency } = input;
    const { acceptedCurrencies } = PAYMENTS[kind];

    if (kind === 'qpayQuickqr') {
      const api = new QPayQuickQrAPI(config);

      const { isCompany } = config;

      let apiResponse;
      try {
        if (isCompany) {
          apiResponse = await api.updateCompany(config);
        } else {
          apiResponse = await api.updateCustomer(config);
        }

        const { id } = apiResponse;

        config.merchantId = id;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    const doc: any = {
      name,
      status,
      kind,
      config,
      acceptedCurrencies,
    };

    if (currency) {
      doc.acceptedCurrencies = [currency];
    }

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
