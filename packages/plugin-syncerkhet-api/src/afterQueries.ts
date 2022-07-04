import { sendRequest } from '@erxes/api-utils/src/requests';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendCoreMessage } from './messageBroker';

export default {
  products: ['products']
};

export const afterQueryHandlers = async (subdomain, data) => {
  const { args, results, queryName } = data;

  if (queryName !== 'products') {
    return results;
  }

  const { pipelineId } = args;

  if (!pipelineId || !(await isEnabled('syncerkhet'))) {
    return results;
  }
  try {
    const configs = await sendCoreMessage({
      subdomain,
      action: 'getConfig',
      data: { code: 'ERKHET', defaultValue: {} },
      isRPC: true
    });

    const remConfigs = await sendCoreMessage({
      subdomain,
      action: 'getConfig',
      data: { code: 'remainderConfig', defaultValue: {} },
      isRPC: true
    });

    if (!Object.keys(remConfigs).includes(pipelineId)) {
      return results;
    }

    const remConfig = remConfigs[pipelineId];

    const codes = (results || []).map(item => item.code);

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
      }
    });

    const jsonRes = JSON.parse(response);
    let responseByCode = jsonRes;

    if (remConfig.account && remConfig.location) {
      responseByCode = jsonRes[remConfig.account][remConfig.location] || {};
    }

    for (const r of results) {
      r.name = r.name.concat(` (${responseByCode[r.code] || '-0'})`);
    }
  } catch (e) {
    console.log(e.message);
    return results;
  }
  return results;
};
