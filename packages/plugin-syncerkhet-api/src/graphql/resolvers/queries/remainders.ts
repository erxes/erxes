import { IContext } from '../../../connectionResolver';
import { sendRequest } from '@erxes/api-utils/src/requests';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from '../../../messageBroker';
import { getPureDate } from '@erxes/api-utils/src';

const erkhetQueries = {
  async erkhetRemainders(
    _root,
    { productIds, stageId, pipelineId },
    { subdomain, models }: IContext
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
      const configs = await models.Configs.getConfig('ERKHET');

      const remConfigs = await models.Configs.getConfig('remainderConfig');

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
  },

  async erkhetDebt(
    _root,
    {
      contentType,
      contentId,
      startDate,
      endDate,
      isMore
    }: {
      contentType: string;
      contentId: string;
      startDate?: Date;
      endDate?: Date;
      isMore: boolean;
    },
    { subdomain, models }: IContext
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
          (startDate &&
            getPureDate(startDate)
              .toISOString()
              .slice(0, 10)) ||
          '',
        endDate:
          (endDate &&
            getPureDate(endDate)
              .toISOString()
              .slice(0, 10)) ||
          '',
        isMore: (isMore && 'True') || ''
      };

      switch (contentType) {
        case 'company':
          const company = await sendContactsMessage({
            subdomain,
            action: 'companies.findOne',
            data: { _id: contentId },
            isRPC: true,
            defaultValue: {}
          });

          sendParams.customerCode = company && company.code;
          break;
        case 'user':
          const user = await sendCoreMessage({
            subdomain,
            action: 'users.findOne',
            data: { _id: contentId },
            isRPC: true,
            defaultValue: {}
          });

          sendParams.workerEmail = user && user.email;
          break;
        default:
          const customer = await sendContactsMessage({
            subdomain,
            action: 'customers.findOne',
            data: { _id: contentId },
            isRPC: true,
            defaultValue: {}
          });

          sendParams.customerCode = customer && customer.code;
      }

      if (!sendParams.customerCode && !sendParams.workerEmail) {
        return {};
      }

      const response = await sendRequest({
        url: `${process.env.ERKHET_URL ||
          'https://erkhet.biz'}/get-api/?kind=remainder`,
        method: 'GET',
        params: sendParams,
        timeout: 8000
      });

      const jsonRes = JSON.parse(response);
      return jsonRes;
    } catch (e) {
      console.log(e.message);
      return result;
    }
  }
};

export default erkhetQueries;
