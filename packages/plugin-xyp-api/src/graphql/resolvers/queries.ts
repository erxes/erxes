import fetch from 'node-fetch';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage, sendCoreMessage } from '../../messageBroker';

export interface IXypConfig {
  url: string;
  token: string;
}

const generateFilterRules = (params) => {
  const {
    serviceName,
    responseKey,
    objectType,
    fieldGroup,
    formField,
    title,
  } = params;
  const filter: any = {};

  if (serviceName) {
    filter.serviceName = serviceName
  }
  if (responseKey) {
    filter.responseKey = responseKey
  }
  if (objectType) {
    filter.objectType = objectType
  }
  if (fieldGroup) {
    filter.fieldGroup = fieldGroup
  }
  if (formField) {
    filter.formField = formField
  }
  if (title) {
    filter.title = title
  }
  return filter;
}

const aggregation = async (models, match) => {
  const data = await models.XypData.aggregate([
    {
      $match: { ...match }
    },
    { $sort: { createdAt: -1 } },
    { $unwind: "$data" },
    {
      $group: {
        _id: "$data.serviceName",
        obj: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: {
        newRoot: '$obj'
      }
    }
  ]);


  return data.map(d => ({
    ...d,
    _id: `${d._id}${d.data?.serviceName}`,
    data: [d.data]
  }));
}

const xypQueries = {
  async xypDataList(_root, { contentType, contentTypeIds }, { models }: IContext) {
    let query: any = {};
    if (contentType) {
      query.contentType = contentType;
    }

    if (contentTypeIds?.length) {
      query.contentTypeId = { $in: contentTypeIds };
    }

    return models.XypData.find(query);
  },

  async xypDataByObject(
    _root,
    { contentType, contentTypeId },
    { models, subdomain }: IContext,
  ) {
    const datas = await aggregation(models, {
      contentType, contentTypeId
    });

    if (contentType === 'sales:deal' && !datas.length) {
      const conformitiesCustomerIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: 'deal', mainTypeId: contentTypeId,
          relTypes: ['customer']
        },
        isRPC: true, defaultValue: []
      })
      if (conformitiesCustomerIds.length) {
        return await aggregation(models, {
          contentType: 'core:customer',
          contentTypeId: { $in: conformitiesCustomerIds }
        })
      }

      const conformitiesCompanyIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: 'deal', mainTypeId: contentTypeId,
          relTypes: ['company']
        },
        isRPC: true, defaultValue: []
      })
      if (conformitiesCustomerIds.length) {
        return await aggregation(models, {
          contentType: 'core:company',
          contentTypeId: { $in: conformitiesCompanyIds }
        })
      }
    }
    return datas;
  },

  async xypDataDetail(
    _root,
    { _id, contentType, contentTypeId },
    { models }: IContext,
  ) {
    return models.XypData.findOne({ contentType, contentTypeId });
  },

  async xypsTotalCount(_root, _args, { models }: IContext) {
    return models.XypData.countDocuments();
  },

  async xypRequest(
    _root,
    { wsOperationName, params },
    { models, subdomain }: IContext,
  ) {
    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS',
        },
      },
      isRPC: true,
      defaultValue: null,
    });

    if (!xypConfigs) {
      throw new Error('Config not found');
    }

    const config: IXypConfig = xypConfigs && xypConfigs.value;

    const response = await fetch(config.url + '/api', {
      method: 'post',
      headers: { token: config.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        params,
        wsOperationName,
      }),
      timeout: 10000,
    }).then((res) => res.json());

    return response;
  },

  async xypServiceList(_root, { url, token }, { models, subdomain }: IContext) {
    if (url && token) {
      const response = await fetch(url + '/list', {
        method: 'post',
        headers: { token: token },
        timeout: 9000,
      }).then((res) => res.json());
      return response;
    }

    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS',
        },
      },
      isRPC: true,
      defaultValue: null,
    });

    if (!xypConfigs) {
      throw new Error('Config not found');
    }

    const config: IXypConfig = xypConfigs && xypConfigs.value;

    const response = await fetch(config.url + '/list', {
      method: 'post',
      headers: { token: config.token },
      timeout: 9000,
    }).then((res) => res.json());

    return response;
  },

  async xypServiceListChoosen(_root, { }, { models, subdomain }: IContext) {
    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS',
        },
      },
      isRPC: true,
      defaultValue: null,
    });

    if (!xypConfigs) {
      throw new Error('Config not found');
    }

    return xypConfigs;
  },

  async checkXypData(_root, params: { serviceName: string, customerId?: string, contentType?: string, contentTypeId?: string }, { models }: IContext) {
    const { serviceName, customerId, contentType, contentTypeId } = params;

    if (!serviceName) {
      throw new Error('less params serviceName')
    }
    const filter: any = {
      'data.serviceName': serviceName
    };

    if (!contentTypeId && !customerId) {
      throw new Error('less params')
    }

    if (customerId) {
      filter.customerId = customerId;
    }
    if (contentType) {
      filter.contentType = contentType;
    }
    if (contentTypeId) {
      filter.contentTypeId = contentTypeId;
    }

    return await models.XypData.findOne(filter).sort({ createdAt: -1 })
  },

  async xypSyncRules(_root, params, { models }: IContext) {
    const filter = await generateFilterRules(params);

    return await models.SyncRules.find(filter).lean();
  },

  async xypSyncRulesCount(_root, params, { models }: IContext) {
    const filter = await generateFilterRules(params);
    return await models.SyncRules.find(filter).countDocuments();
  },

  async xypSyncRulesDetail(_root, params, { models }: IContext) {
    const { _id } = params;
    return await models.SyncRules.getSyncRule(_id);
  }
};

export default xypQueries;
