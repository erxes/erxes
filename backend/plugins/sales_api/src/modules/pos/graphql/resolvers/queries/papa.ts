import { IContext } from '~/connectionResolvers';
import {
  getPapaPhotoProof,
  getPapaReferences,
  getPapaWallet,
  listPapaAddresses,
  toConfigView,
} from '../../../papa/service';
import { getPapaDeliveryReport, IPapaReportArgs } from '../../../papa/report';

export const papaQueries = {
  async salesPapaConfig(_root, _args, { models, checkPermission }: IContext) {
    await checkPermission('posPapaConfigManage');

    return toConfigView(await models.PapaConfigs.getConfig());
  },

  async salesPapaReferences(
    _root,
    _args,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderRead');

    return getPapaReferences(models);
  },

  async salesPapaAddresses(
    _root,
    _args,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posRead');

    return listPapaAddresses(models);
  },

  // Read on the POS settings card and on an order's Delivery tab.
  async salesPapaWallet(_root, _args, { models, checkPermission }: IContext) {
    await checkPermission('posOrderPapaManage');

    return getPapaWallet(models);
  },

  async salesPapaDeliveryReport(
    _root,
    args: IPapaReportArgs,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderRead');

    return getPapaDeliveryReport(models, args);
  },

  async posOrderPapaPhotoProof(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    if (!_id) {
      throw new Error('Order id is required');
    }

    return getPapaPhotoProof(models, _id);
  },
};
