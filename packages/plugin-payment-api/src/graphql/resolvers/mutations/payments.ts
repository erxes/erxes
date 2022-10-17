import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { IPayment } from '../../../models/definitions/payments';

const mutations = {
  async paymentAdd(_root, doc: IPayment, { models }: IContext) {
    console.log('paymentAdd', doc);
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
  }
};

requireLogin(mutations, 'paymentAdd');
requireLogin(mutations, 'paymentEdit');
requireLogin(mutations, 'paymentRemove');

checkPermission(mutations, 'paymentAdd', 'paymentAdd', []);
checkPermission(mutations, 'paymentEdit', 'paymentEdit', []);
checkPermission(mutations, 'paymentRemove', 'paymentRemove', []);

export default mutations;
