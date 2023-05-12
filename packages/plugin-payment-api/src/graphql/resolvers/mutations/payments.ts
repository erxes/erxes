import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { IPayment } from '../../../models/definitions/payments';
import { QPayQuickQrAPI } from '../../../api/qpayQuickqr/api';

const mutations = {
  async paymentAdd(_root, doc: IPayment, { models }: IContext) {
    if (doc.kind === 'qpayQuickqr') {
      const api = new QPayQuickQrAPI();

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

    return models.Payments.createPayment(doc);
  },

  async paymentRemove(_root, { _id }: { _id: string }, { models }: IContext) {
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
