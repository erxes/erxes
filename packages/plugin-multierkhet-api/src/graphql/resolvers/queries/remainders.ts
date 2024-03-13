import { IContext } from '../../../connectionResolver';
import fetch from 'node-fetch';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage,
} from '../../../messageBroker';
import { getPureDate } from '@erxes/api-utils/src';

const erkhetQueries = {
  async multiErkhetRemainders(
    _root,
    { productIds, stageId, pipelineId },
    { subdomain, models }: IContext,
  ) {
    if (!pipelineId && stageId) {
      const pipeline = await sendCardsMessage({
        subdomain,
        action: 'pipelines.findOne',
        data: { stageId },
        isRPC: true,
        defaultValue: {},
      });
      pipelineId = pipeline._id;
    }

    const result: {
      _id: string;
      remainder: number;
    }[] = [];

    try {
      const configs = await models.Configs.getConfig('erkhetConfig');

      const remConfigs = await models.Configs.getConfig('remainderConfig');

      if (!Object.keys(remConfigs).includes(pipelineId)) {
        return [];
      }

      const remConfig = remConfigs[pipelineId];

      const configBrandIds = Object.keys(configs);
      const codesByBrandId = {};

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { query: { _id: { $in: productIds } }, limit: productIds.length },
        isRPC: true,
        defaultValue: [],
      });

      for (const product of products) {
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

      for (const r of products) {
        result.push({
          _id: r._id,
          remainder: Number(responseByCode[r.code]),
        });
      }
    } catch (e) {
      console.log(e.message);
      return result;
    }

    return result;
  },

  async multiErkhetDebt(
    _root,
    {
      contentType,
      contentId,
      startDate,
      endDate,
      isMore,
      brandId,
    }: {
      contentType: string;
      contentId: string;
      startDate?: Date;
      endDate?: Date;
      isMore: boolean;
      brandId?: string;
    },
    { subdomain, models }: IContext,
  ) {
    const result: any = {};

    try {
      const configs = await models.Configs.getConfig('ERKHET', {});

      if (!configs || !Object.keys(configs).length) {
        return {};
      }

      if (configs.url || !configs.debtAccounts) {
        return {};
      }

      const sendParams: any = {
        kind: 'debt',
        api_key: configs.apiKey,
        api_secret: configs.apiSecret,
        accounts: configs.debtAccounts,
        startDate:
          (startDate && getPureDate(startDate).toISOString().slice(0, 10)) ||
          '',
        endDate:
          (endDate && getPureDate(endDate).toISOString().slice(0, 10)) || '',
        isMore: (isMore && 'True') || '',
      };

      switch (contentType) {
        case 'company':
          const company = await sendContactsMessage({
            subdomain,
            action: 'companies.findOne',
            data: { _id: contentId },
            isRPC: true,
            defaultValue: {},
          });

          sendParams.customerCode = company && company.code;
          break;
        case 'user':
          const user = await sendCoreMessage({
            subdomain,
            action: 'users.findOne',
            data: { _id: contentId },
            isRPC: true,
            defaultValue: {},
          });

          sendParams.workerEmail = user && user.email;
          break;
        default:
          const customer = await sendContactsMessage({
            subdomain,
            action: 'customers.findOne',
            data: { _id: contentId },
            isRPC: true,
            defaultValue: {},
          });

          sendParams.customerCode = customer && customer.code;
      }

      if (!sendParams.customerCode && !sendParams.workerEmail) {
        return {};
      }

      const response = await fetch(
        `${process.env.ERKHET_URL || 'https://erkhet.biz'}/get-api/?` +
          new URLSearchParams({ ...sendParams, kind: 'remainder' }),
        {
          timeout: 8000,
        },
      );

      const jsonRes = await response.json();
      return jsonRes;
    } catch (e) {
      console.log(e.message);
      return result;
    }
  },
};

export default erkhetQueries;
