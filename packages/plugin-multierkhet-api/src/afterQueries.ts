import fetch from 'node-fetch';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { generateModels } from './connectionResolver';

export default {
  products: ['products'],
};

export const afterQueryHandlers = async (subdomain, data) => {
  const { args, results, queryName } = data;
  const models = await generateModels(subdomain);

  if (queryName !== 'products') {
    return results;
  }

  const { pipelineId } = args;

  if (!pipelineId || !(await isEnabled('multierkhet'))) {
    return results;
  }
  try {
    const configs = await models.Configs.getConfig('erkhetConfig', {});
    const remConfigs = await models.Configs.getConfig('remainderConfig', {});

    if (!Object.keys(remConfigs).includes(pipelineId)) {
      return results;
    }

    const remConfig = remConfigs[pipelineId];

    const configBrandIds = Object.keys(configs);
    const codesByBrandId = {};

    for (const product of results) {
      if (
        !(product.scopeBrandIds || []).length &&
        configBrandIds.includes('noBrand')
      ) {
        if (!codesByBrandId['noBrand']) {
          codesByBrandId['noBrand'] = [];
        }
        codesByBrandId['noBrand'].push(product.code);
        continue;
      }

      for (const brandId of configBrandIds) {
        if (product.scopeBrandIds.includes(brandId)) {
          if (!codesByBrandId[brandId]) {
            codesByBrandId[brandId] = [];
          }

          codesByBrandId[brandId].push(product.code);
          continue;
        }
      }
    }

    let responseByCode = {};

    for (const brandId of Object.keys(codesByBrandId)) {
      const mainConfig = configs[brandId];
      const remainderConfig = (remConfig.rules || {})[brandId];

      if (!codesByBrandId[brandId].length) {
        continue;
      }

      const response = await fetch(
        `${process.env.ERKHET_URL || 'https://erkhet.biz'}/get-api/?` +
          new URLSearchParams({
            kind: 'remainder',
            api_key: mainConfig.apiKey,
            api_secret: mainConfig.apiSecret,
            check_relate: codesByBrandId[brandId].length < 4 ? '1' : '',
            accounts: remainderConfig.account,
            locations: remainderConfig.location,
            inventories: codesByBrandId[brandId].join(','),
          }),
        {
          timeout: 8000,
        },
      );

      const jsonRes = await response.json();

      if (remainderConfig.account && remainderConfig.location) {
        const accounts = remainderConfig.account.split(',') || [];
        const locations = remainderConfig.location.split(',') || [];

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
