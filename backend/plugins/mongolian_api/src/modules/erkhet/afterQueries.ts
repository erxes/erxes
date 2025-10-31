import fetch from 'node-fetch';
import { isEnabled } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  products: ['products'],
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
    const configs = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'configs',
      action: 'getConfig',
      method: 'query',
      input: { code: 'ERKHET', defaultValue: {} },
      defaultValue: {},
    });

    const remConfigs = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'configs',
      action: 'getConfig',
      method: 'query',
      input: { code: 'remainderConfig', defaultValue: {} },
      defaultValue: {},
    });


    if (!Object.keys(remConfigs).includes(pipelineId)) {
      return results;
    }

    const remConfig = remConfigs[pipelineId];

    const codes = (results || []).map((item) => item.code);

    const response = await fetch(
      configs.getRemainderApiUrl +
        '?' +
        new URLSearchParams({
          kind: 'remainder',
          api_key: configs.apiKey,
          api_secret: configs.apiSecret,
          check_relate: codes.length < 4 ? '1' : '',
          accounts: remConfig.account,
          locations: remConfig.location,
          inventories: codes.join(','),
        }),
      {
        timeout: 8000,
      },
    );

    const jsonRes = await response.json();
    let responseByCode = {};

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
