import { IContext } from '~/connectionResolvers';
import {
  approvePapaPhotoProof,
  cancelPapaDelivery,
  createPapaAddress,
  markPapaDelivered,
  IPapaQuoteArgs,
  IPapaSendArgs,
  quotePapaDelivery,
  refreshPapaDelivery,
  savePapaConfig,
  sendPapaDelivery,
} from '../../../papa/service';

const requireId = (_id?: string) => {
  if (!_id) {
    throw new Error('Order id is required');
  }

  return _id;
};

export const papaMutations = {
  async salesPapaConfigSave(
    _root,
    {
      staffPhone,
      staffEmail,
      staffFirstName,
      staffLastName,
      ...args
    }: {
      apiUrl?: string;
      clientId: string;
      clientSecret?: string;
      staffPhone?: string;
      staffEmail?: string;
      staffFirstName?: string;
      staffLastName?: string;
    },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('posPapaConfigManage');

    return savePapaConfig(
      models,
      subdomain,
      {
        ...args,
        staff: {
          phone: staffPhone,
          email: staffEmail,
          firstname: staffFirstName,
          lastname: staffLastName,
        },
      },
      user?._id,
    );
  },

  async salesPapaAddressCreate(
    _root,
    args: {
      locationId: string;
      address: string;
      latitude: string;
      longitude: string;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posPapaConfigManage');

    return createPapaAddress(models, args);
  },

  async posOrderPapaQuote(
    _root,
    { _id, ...args }: IPapaQuoteArgs & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    return quotePapaDelivery(models, requireId(_id), args);
  },

  async posOrderPapaSend(
    _root,
    { _id, ...args }: IPapaSendArgs & { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    return sendPapaDelivery(models, requireId(_id), args, user?._id);
  },

  async posOrderPapaRefresh(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    return refreshPapaDelivery(models, requireId(_id));
  },

  async posOrderPapaCancel(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    return cancelPapaDelivery(models, requireId(_id));
  },

  async posOrderPapaApprovePhoto(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    return approvePapaPhotoProof(models, requireId(_id));
  },

  async posOrderPapaMarkDelivered(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderPapaManage');

    return markPapaDelivered(models, requireId(_id));
  },
};
