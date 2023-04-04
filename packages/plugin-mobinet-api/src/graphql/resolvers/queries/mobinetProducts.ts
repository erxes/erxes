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

const queries = {
  mobinetServices: async (_root, args, { models, subdomain }: IContext) => {
    const { page, perPage, searchValue, districtId, hbb, voo } = args;

    const filter: any = {};

    if (searchValue) {
      filter.searchText = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
    }

    const district = await models.Districts.getDistrict({ _id: districtId });

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

    console.log('config', config);

    let vooProducts: any = [];
    const hbbProducts: { fttb: []; ftth: [] } = { fttb: [], ftth: [] };

    if (hbb) {
      hbbProducts.ftth = await sendCommonMessage({
        subdomain,
        serviceName: 'products',
        action: 'find',
        data: {
          query: {
            tagIds: {
              $in: [config.ftthTagId, district.isCapital && config.capitalTagId]
            },
            type: 'service'
          },
          skip: (page - 1) * perPage,
          limit: perPage,
          categoryId: config.hbbCatId
        },
        isRPC: true,
        defaultValue: []
      });

      const fttb = await sendCommonMessage({
        subdomain,
        serviceName: 'products',
        action: 'find',
        data: {
          query: {
            tagIds: {
              $in: [config.fttbTagId, district.isCapital && config.capitalTagId]
            },
            type: 'service'
          },
          categoryId: config.hbbCatId
        },
        isRPC: true,
        defaultValue: []
      });

      console.log('fttb', fttb);
      hbbProducts.fttb = fttb;
    }

    console.log('voo', voo);
    console.log('hbbProducts', hbbProducts);

    if (voo) {
      vooProducts = await sendCommonMessage({
        subdomain,
        serviceName: 'products',
        action: 'find',
        data: {
          query: {
            tagIds: { $in: [config.vooCatId] },
            type: 'service'
          },
          skip: (page - 1) * perPage,
          limit: perPage,
          categoryId: config.vooCatId
        },
        isRPC: true,
        defaultValue: []
      });
    }

    return {
      hbbServices: hbbProducts,
      vooServices: vooProducts
    };
  }
};

export default queries;
