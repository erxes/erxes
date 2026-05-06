import { IPosSlotDocument } from '@/pos/@types/orders';
import { IPosDocument } from '@/pos/@types/pos';
import { getConfigData, getProductsData } from '@/pos/routes';
import { IModels } from '~/connectionResolvers';
import { sendPosclientMessage } from '~/initWorker';

export const syncPosToClient = async (subdomain: string, pos: IPosDocument) => {
  const configData = await getConfigData(subdomain, pos);

  return await sendPosclientMessage({
    subdomain,
    action: 'manageConfig',
    method: 'mutation',
    input: {
      ...configData,
    },
    isAwait: true,
    pos,
  });
};

export const syncRemovePosToClient = async (
  subdomain: string,
  pos: IPosDocument,
) => {
  return await sendPosclientMessage({
    subdomain,
    action: 'removeConfig',
    method: 'mutation',
    input: {
      posId: pos._id,
      posToken: pos.token,
    },
    isAwait: true,
    pos,
  });
};

export const syncProductGroupsToClient = async (
  subdomain: string,
  models: IModels,
  pos: IPosDocument,
) => {
  const productGroups = await getProductsData(subdomain, models, pos);

  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    method: 'mutation',
    input: {
      type: 'productGroups',
      token: pos.token,
      productGroups,
    },
    pos,
  });
};

export const syncSlotsToClient = async (
  subdomain: string,
  pos: IPosDocument,
  slots: IPosSlotDocument[],
) => {
  await sendPosclientMessage({
    subdomain,
    action: 'crudData',
    method: 'mutation',
    input: {
      type: 'slots',
      token: pos.token,
      slots,
    },
    pos,
  });
};
