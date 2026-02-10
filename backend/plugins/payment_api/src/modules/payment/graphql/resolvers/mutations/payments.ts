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
    args: any,
    { models, subdomain }: IContext,
  ) {
    const { input } = args;

    if (!input?.kind) {
      throw new Error('Payment kind is required');
    }

    const paymentConfig = PAYMENTS[input.kind];

    if (!paymentConfig) {
      throw new Error(`Unsupported payment kind: ${input.kind}`);
    }


    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';

    const domain = DOMAIN.replace('<subdomain>', subdomain);


    input.acceptedCurrencies = paymentConfig.acceptedCurrencies;

    if (input.config?.currency) {
      input.acceptedCurrencies = [input.config.currency];
    }


    if (input.kind === 'qpayQuickqr') {
      // 🔥 FRONTEND → BACKEND FIX
      if (input.config?.type) {
        input.config.isCompany = input.config.type === 'company';
        delete input.config.type;
      }

      const api = new QPayQuickQrAPI(input.config);
      const { isCompany } = input.config;

      try {
        const response = isCompany
          ? await api.createCompany(input.config)
          : await api.createCustomer(input.config);

        if (!response?.id) {
          throw new Error(
            `QPay did not return merchant id: ${JSON.stringify(response)}`
          );
        }

        input.config.merchantId = response.id;
      } catch (e: any) {
        console.error('QPay ERROR FULL:', e);
        console.error('QPay ERROR JSON:', JSON.stringify(e, null, 2));

        throw new Error(
          e?.message ||
          e?.response?.data?.message ||
          JSON.stringify(e)
        );
      }
    }


    const payment = await models.PaymentMethods.createPayment(input);

    if (input.kind === 'pocket') {
      const pocketApi = new PocketAPI(input.config, domain);
      try {
        await pocketApi.registerWebhook(payment._id);
      } catch (e: any) {
        await models.PaymentMethods.removePayment(payment._id);

        throw new Error(
          e?.message ||
          e?.response?.data?.message ||
          'Pocket webhook registration failed'
        );
      }
    }


    if (input.kind === 'stripe') {
      const stripeApi = new StripeAPI(input.config, domain);
      try {
        await stripeApi.registerWebhook(payment._id);
      } catch (e: any) {
        await models.PaymentMethods.removePayment(payment._id);

        throw new Error(
          e?.message ||
          e?.response?.data?.message ||
          'Stripe webhook registration failed'
        );
      }
    }


    const api = new ErxesPayment(payment);

    try {
      await api.authorize(payment);
    } catch (e: any) {
      console.error('AUTHORIZE ERROR FULL:', e);
      console.error('AUTHORIZE ERROR JSON:', JSON.stringify(e, null, 2));

      await models.PaymentMethods.removePayment(payment._id);

      throw new Error(
        e?.message ||
        e?.response?.data?.message ||
        JSON.stringify(e)
      );
    }

    return payment;
  },

  async paymentRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    await models.PaymentMethods.removePayment(_id);
    return 'success';
  },

  async paymentEdit(
    _root,
    args: any,
    { models }: IContext,
  ) {
    const { _id, input } = args;
    const { name, status, kind, config, currency } = input;

    const paymentConfig = PAYMENTS[kind];

    if (!paymentConfig) {
      throw new Error(`Unsupported payment kind: ${kind}`);
    }

    if (kind === 'qpayQuickqr') {
      if (config?.type) {
        config.isCompany = config.type === 'company';
        delete config.type;
      }

      const api = new QPayQuickQrAPI(config);
      const { isCompany } = config;

      try {
        const response = isCompany
          ? await api.updateCompany(config)
          : await api.updateCustomer(config);

        if (!response?.id) {
          throw new Error('QPay update did not return merchant id');
        }

        config.merchantId = response.id;
      } catch (e: any) {
        throw new Error(
          e?.message ||
          e?.response?.data?.message ||
          JSON.stringify(e)
        );
      }
    }

    const doc: any = {
      name,
      status,
      kind,
      config,
      acceptedCurrencies: paymentConfig.acceptedCurrencies,
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
