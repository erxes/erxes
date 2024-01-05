import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { getEnv } from '@erxes/api-utils/src/core';
import { PAYMENTS } from '../../../api/constants';
import { PocketAPI } from '../../../api/pocket/api';
import { QPayQuickQrAPI } from '../../../api/qpayQuickqr/api';
import { IContext } from '../../../connectionResolver';
import { IPayment } from '../../../models/definitions/payments';

const mutations = {
  async paymentAdd(_root, doc: IPayment, { models, subdomain }: IContext) {
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

    const payment = await models.Payments.createPayment(doc);

    if (doc.kind === 'pocket') {
      const DOMAIN = getEnv({ name: 'DOMAIN' })
        ? `${getEnv({ name: 'DOMAIN' })}/gateway`
        : 'http://localhost:4000';
      const domain = DOMAIN.replace('<subdomain>', subdomain);

      const pocketApi = new PocketAPI(doc.config, domain);
      try {
        await pocketApi.resiterWebhook(payment._id);
      } catch (e) {
        await models.Payments.removePayment(payment._id);
        throw new Error(`Error while registering pocket webhook: ${e.message}`);
      }
    }

    return payment;
  },

  async paymentRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    const payment = await models.Payments.getPayment(_id);

    if (payment.kind === PAYMENTS.qpayQuickqr.kind) {
      const api = new QPayQuickQrAPI(payment.config);

      try {
        await api.removeMerchant();
      } catch (e) {
        throw new Error(e.message);
      }
    }

    await models.Payments.removePayment(_id);

    return 'success';
  },

  async paymentEdit(
    _root,
    {
      _id,
      name,
      status,
      kind,
      config
    }: { _id: string; name: string; status: string; kind: string; config: any },
    { models }: IContext
  ) {
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

    return await models.Payments.updatePayment(_id, {
      name,
      status,
      kind,
      config
    });
  },

  async qpayRegisterMerchantCompany(_root, args, { models }: IContext) {
    const api = new QPayQuickQrAPI({
      username: process.env.QUICK_QR_USERNAME || '',
      password: process.env.QUICK_QR_PASSWORD || ''
    });

    return api.createCompany(args);
  },

  async qpayCreateInvoice(_root, args, { models }: IContext) {
    const api = new QPayQuickQrAPI({
      username: process.env.QUICK_QR_USERNAME || '',
      password: process.env.QUICK_QR_PASSWORD || ''
    });

    return api.createInvoice(args);
  },

  async qpayRegisterMerchantCustomer(_root, args, { models }: IContext) {
    const api = new QPayQuickQrAPI({
      username: process.env.QUICK_QR_USERNAME || '',
      password: process.env.QUICK_QR_PASSWORD || ''
    });

    return api.createCustomer(args);
  }
};

requireLogin(mutations, 'paymentAdd');
requireLogin(mutations, 'paymentEdit');
requireLogin(mutations, 'paymentRemove');

checkPermission(mutations, 'paymentAdd', 'paymentAdd', []);
checkPermission(mutations, 'paymentEdit', 'paymentEdit', []);
checkPermission(mutations, 'paymentRemove', 'paymentRemove', []);

export default mutations;
