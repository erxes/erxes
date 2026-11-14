import { IContext } from '~/connectionResolvers';
import {
  getPapaPhotoProof,
  getPapaReferences,
  listPapaAddresses,
  toConfigView,
} from '../../../papa/service';

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
