import { sendRequest } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

export interface IXypConfig {
  url: string;
  token: string;
}

const xypQueries = {
  xypDataList(_root, { contentType, contentTypeIds }, { models }: IContext) {
    let query = {};
    if (contentType) query['contentType'] = contentType;
    if (contentTypeIds) query['contentTypeId'] = { $in: contentTypeIds };
    return models.XypData.find(query);
  },

  xypDataDetail(
    _root,
    { _id, contentType, contentTypeId },
    { models }: IContext
  ) {
    return models.XypData.findOne({ contentType, contentTypeId });
  },

  xypsTotalCount(_root, _args, { models }: IContext) {
    return models.XypData.countDocuments();
  },

  async xypRequest(
    _root,
    { wsOperationName, params },
    { models, subdomain }: IContext
  ) {
    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS'
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!xypConfigs) {
      throw new Error('Config not found');
    }

    const config: IXypConfig = xypConfigs && xypConfigs.value;

    const response = await sendRequest({
      url: config.url + '/api',
      method: 'post',
      headers: { token: config.token },
      body: {
        params,
        wsOperationName
      },
      timeout: 10000
    });

    return response;
  },

  async xypServiceList(_root, { url, token }, { models, subdomain }: IContext) {
    if (url && token) {
      const response = await sendRequest({
        url: url + '/list',
        method: 'post',
        headers: { token: token },
        timeout: 9000
      });
      return response;
    }

    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS'
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!xypConfigs) {
      throw new Error('Config not found');
    }

    const config: IXypConfig = xypConfigs && xypConfigs.value;

    const response = await sendRequest({
      url: config.url + '/list',
      method: 'post',
      headers: { token: config.token },
      timeout: 9000
    });

    return response;
  },

  async xypServiceListChoosen(_root, {}, { models, subdomain }: IContext) {
    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS'
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!xypConfigs) {
      throw new Error('Config not found');
    }

    return xypConfigs;
  }
};

export default xypQueries;
