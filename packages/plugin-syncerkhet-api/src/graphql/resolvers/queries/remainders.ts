import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendCardsMessage, sendProductsMessage } from '../../../messageBroker';

const erkhetQueries = {
  async erkhetRemainders(
    _root,
    { productIds, stageId, pipelineId },
    { subdomain }: IContext
  ) {
    if (!pipelineId && stageId) {
      const pipeline = await sendCardsMessage({
        subdomain,
        action: 'pipelines.findOne',
        data: { stageId },
        isRPC: true,
        defaultValue: {}
      });
      pipelineId = pipeline._id;
    }

    const result: {
      _id: string;
      remainder: number;
    }[] = [];

    try {
      const configs = await getConfig(subdomain, 'ERKHET');

      const remConfigs = await getConfig(subdomain, 'remainderConfig');

      if (!Object.keys(remConfigs).includes(pipelineId)) {
        return [];
      }

      const remConfig = remConfigs[pipelineId];

      if (!remConfig || !Object.keys(remConfig).length) {
        return [];
      }

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { query: { _id: { $in: productIds } }, limit: productIds.length },
        isRPC: true,
        defaultValue: []
      });

      const codes = (products || []).map(item => item.code);

      const response = await sendRequest({
        url: configs.getRemainderApiUrl,
        method: 'GET',
        params: {
          kind: 'remainder',
          api_key: configs.apiKey,
          api_secret: configs.apiSecret,
          check_relate: codes.length < 4 ? '1' : '',
          accounts: remConfig.account,
          locations: remConfig.location,
          inventories: codes.join(',')
        },
        timeout: 8000
      });

      const jsonRes = JSON.parse(response);
      let responseByCode = jsonRes;

      if (remConfig.account && remConfig.location) {
        const accounts = remConfig.account.split(',') || [];
        const locations = remConfig.location.split(',') || [];

        for (const acc of accounts) {
          for (const loc of locations) {
            const resp = (jsonRes[acc] || {})[loc] || {};
            for (const invCode of Object.keys(resp)) {
              if (!Object.keys(responseByCode).includes(invCode)) {
                responseByCode[invCode] = 0;
              }
              const remainder = Number(resp[invCode]) || 0;

              responseByCode[invCode] = responseByCode[invCode] + remainder;
            }
          }
        }
      }

      for (const r of products) {
        result.push({
          _id: r._id,
          remainder: Number(responseByCode[r.code])
        });
      }
    } catch (e) {
      console.log(e.message);
      return result;
    }

    return result;
  }
};

export default erkhetQueries;
