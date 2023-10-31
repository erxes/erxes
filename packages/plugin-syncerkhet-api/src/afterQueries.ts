import { sendRequest } from '@erxes/api-utils/src/requests';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export default {
  products: ['products']
};

export const afterQueryHandlers = async (subdomain, data) => {
  const { args, results, queryName } = data;
  const models = await generateModels(subdomain);

  if (queryName !== 'products') {
    return results;
  }

  const { pipelineId } = args;

  if (!pipelineId || !(await isEnabled('syncerkhet'))) {
    return results;
  }
  try {
    const configs = await models.Configs.getConfig('ERKHET', {});
    const remConfigs = await models.Configs.getConfig('remainderConfig', {});

    if (!Object.keys(remConfigs).includes(pipelineId)) {
      return results;
    }

    const remConfig = remConfigs[pipelineId];

    const codes = (results || []).map(item => item.code);

    const response = await sendRequest({
      url: `${process.env.ERKHET_URL ||
        'https://erkhet.biz'}/get-api/?kind=remainder`,
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
              responseByCode[invCode] = '';
            }
            const remainder = `${accounts.length > 1 ? `${acc}/` : ''}${
              locations.length > 1 ? `${loc}:` : ''
            } ${resp[invCode]}`;
            responseByCode[invCode] = responseByCode[invCode]
              ? `${responseByCode[invCode]}, ${remainder}`
              : `${remainder}`;
          }
        }
      }
    }

    for (const r of results) {
      r.name = (r.name || '').concat(` (${responseByCode[r.code] || '-0'})`);
    }
  } catch (e) {
    console.log(e.message);
    return results;
  }
  return results;
};
