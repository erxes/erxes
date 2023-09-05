import { sendPosclientMessage } from '../../../messageBroker';
import { getConfigData, getProductsData } from '../../../routes';
import {
  IPosDocument,
  IPosSlotDocument
} from '../../../models/definitions/pos';
import { IModels } from '../../../connectionResolver';

export const syncPosToClient = async (subdomain: string, pos: IPosDocument) => {
  const configData = await getConfigData(subdomain, pos);

  return await sendPosclientMessage({
    subdomain,
    action: 'configs.manage',
    data: {
      type: 'pos',
      ...configData
    },
    isRPC: true,
    pos
  });
};

export const syncRemovePosToClient = async (
  subdomain: string,
  pos: IPosDocument
) => {
  return await sendPosclientMessage({
    subdomain,
    action: 'configs.remove',
    data: {
      type: 'pos',
      posId: pos._id,
      posToken: pos.token
    },
    isRPC: true,
    pos
  });
};

export const syncProductGroupsToClient = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument
) => {
  const productGroups = await getProductsData(subdomain, models, pos);

  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    data: {
      type: 'productGroups',
      token: pos.token,
      productGroups
    },
    pos
  });
};

export const syncSlotsToClient = async (
  subdomain: string,
  pos: IPosDocument,
  slots: IPosSlotDocument[]
) => {
  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    data: {
      type: 'slots',
      slots,
      token: pos.token
    },
    pos
  });
};
