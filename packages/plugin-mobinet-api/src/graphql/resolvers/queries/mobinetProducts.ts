import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

interface ITicketConfig {
  boardId: string;
  pipelineId: string;
  stageId: string;
}

export interface IMobinetConfig {
  fttbTagId: string;
  ftthTagId: string;
  capitalTagId: string;
  vooCatId: string;
  hbbCatId: string;
  installationTicket: ITicketConfig;
  repairTicket: ITicketConfig;
}

const getProducts = async (models, subdomain, args, kind) => {
  const { searchValue, buildingId, districtId, hbb, voo } = args;
  const filter: any = {};

  if (searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
  }

  const mobinetConfigs = await sendCommonMessage({
    subdomain,
    serviceName: 'core',
    action: 'configs.findOne',
    data: {
      query: {
        code: 'MOBINET_CONFIGS'
      }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!mobinetConfigs) {
    throw new Error('Config not found');
  }

  const config: IMobinetConfig = mobinetConfigs && mobinetConfigs.value;

  if (!config.hbbCatId || !config.vooCatId) {
    throw new Error('Config not found');
  }

  const building = await models.Buildings.getBuilding({ _id: buildingId });

  if (building.networkType === 'ftth' && !config.ftthTagId) {
    throw new Error('Config not found');
  }

  if (building.networkType === 'fttb' && !config.fttbTagId) {
    throw new Error('Config not found');
  }

  const district = await models.Districts.getDistrict({ _id: districtId });

  let vooProducts: any = [];
  let hbbProducts: any = [];

  if (hbb) {
    hbbProducts = await sendCommonMessage({
      subdomain,
      serviceName: 'products',
      action: 'find',
      data: {
        query: {
          tagIds: {
            $all: [
              building.networkType === 'ftth'
                ? config.ftthTagId
                : config.fttbTagId,
              district.isCapital && config.capitalTagId
            ]
          },
          type: kind
        },
        categoryId: config.hbbCatId
      },
      isRPC: true,
      defaultValue: []
    });
  }

  if (voo) {
    vooProducts = await sendCommonMessage({
      subdomain,
      serviceName: 'products',
      action: 'find',
      data: {
        query: {
          type: kind
        },
        categoryId: config.vooCatId
      },
      isRPC: true,
      defaultValue: []
    });
  }

  return { hbbProducts, vooProducts };
};

const queries = {
  mobinetServices: async (_root, args, { models, subdomain }: IContext) => {
    const { hbbProducts, vooProducts } = await getProducts(
      models,
      subdomain,
      args,
      'service'
    );

    return {
      hbbServices: hbbProducts,
      vooServices: vooProducts
    };
  },

  mobinetProducts: async (_root, args, { models, subdomain }: IContext) => {
    const { hbbProducts, vooProducts } = await getProducts(
      models,
      subdomain,
      args,
      'product'
    );

    return {
      hbbProducts,
      vooProducts
    };
  }
};

export default queries;
