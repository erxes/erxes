import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { getEnv } from '@erxes/api-utils/src/core';
import { PAYMENTS } from '../../../api/constants';
import { PocketAPI } from '../../../api/pocket/api';
import { QPayQuickQrAPI } from '../../../api/qpayQuickqr/api';
import { IContext } from '../../../connectionResolver';
import { IPayment } from '../../../models/definitions/payments';
import { StripeAPI } from '../../../api/stripe/api';
import ErxesPayment from '../../../api/ErxesPayment';

const mutations = {
  async paymentAdd(_root, doc: IPayment, { models, subdomain }: IContext) {
    console.debug('Adding payment', doc, ' to ', subdomain);
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';
    const domain = DOMAIN.replace('<subdomain>', subdomain);
    const acceptedCurrencies = PAYMENTS[doc.kind].acceptedCurrencies;
    doc.acceptedCurrencies = acceptedCurrencies;

    if (doc.kind === 'qpayQuickqr') {
      const api = new QPayQuickQrAPI(doc.config);

      const { isCompany } = doc.config;

      let apiResponse;
      try {
        if (isCompany) {
          apiResponse = await api.createCompany(doc.config);
        } else {
          apiResponse = await api.createCustomer(doc.config);
        }

        const { id } = apiResponse;

        doc.config.merchantId = id;
      } catch (e) {
        throw new Error(e.message);
      }
    }

    const payment = await models.PaymentMethods.createPayment(doc);
    console.debug('payment', payment);
    if (doc.kind === 'pocket') {
      const pocketApi = new PocketAPI(doc.config, domain);
      try {
        await pocketApi.resiterWebhook(payment._id);
      } catch (e) {
        await models.PaymentMethods.removePayment(payment._id);
        throw new Error(`Error while registering pocket webhook: ${e.message}`);
      }
    }

    if (doc.kind === 'stripe') {
      const stripeApi = new StripeAPI(doc.config, domain);
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

  async paymentEdit(
    _root,
    {
      _id,
      name,
      status,
      kind,
      config,
    }: { _id: string; name: string; status: string; kind: string; config: any },
    { models }: IContext
  ) {
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

    return await models.PaymentMethods.updatePayment(_id, {
      name,
      status,
      kind,
      config,
      acceptedCurrencies,
    });
  },
};

requireLogin(mutations, 'paymentAdd');
requireLogin(mutations, 'paymentEdit');
requireLogin(mutations, 'paymentRemove');

checkPermission(mutations, 'paymentAdd', 'paymentAdd', []);
checkPermission(mutations, 'paymentEdit', 'paymentEdit', []);
checkPermission(mutations, 'paymentRemove', 'paymentRemove', []);

export default mutations;
