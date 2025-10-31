import { IContext } from '~/connectionResolvers';
import { getConfig } from '~/modules/erkhet/utils/utils';
import fetch from 'node-fetch';
import { sendTRPCMessage } from 'erxes-api-shared/src/utils';
import { getPureDate } from 'erxes-api-shared/src/utils';

type IParams = {
  stageId?: string;
  pipelineId?: string;
  posId?: string;
  accountCodes?: string;
  locationCodes?: string;
  productIds?: string[];
}

const getRemConfig = async (
  subdomain,
  { stageId, pipelineId, posId, accountCodes, locationCodes }: IParams,
) => {
  if (stageId || pipelineId) {
    if (!pipelineId) {
      const pipeline = await sendTRPCMessage({
        subdomain,
        pluginName: 'sales',
        method: 'query',
        module: 'pipelines',
        action: 'findOne',
        input: { stageId },
        defaultValue: {},
      });

      pipelineId = pipeline?._id;
    }

    if (!pipelineId) {
      return {};
    }

    const remConfigs = await getConfig(subdomain, 'remainderConfig');
    const remConfig = remConfigs[pipelineId];

    return {
      account: remConfig?.account,
      location: remConfig?.location,
    };
  }

  if (posId) {
    const posConfig = await sendTRPCMessage({
      subdomain,
      pluginName: 'pos',
      method: 'query',
      module: 'configs',
      action: 'findOne',
      input: { _id: posId },
      defaultValue: {},
    });

    const posErkhetConfig = await posConfig?.erkhetConfig;
    return {
      account: posErkhetConfig?.account,
      location: posErkhetConfig?.location,
    };
  }

  if (accountCodes?.length || locationCodes?.length) {
    return {
      account: accountCodes,
      location: locationCodes,
    };
  }

  return {};
};

export const erkhetQueries = {
  async erkhetRemainders(
    _root,
    {
      productIds,
      stageId,
      pipelineId,
      posId,
      accountCodes,
      locationCodes,
    }: IParams,
    { subdomain }: IContext,
  ) {
    const result: {
      _id: string;
      remainder: number;
      remainders: any[];
    }[] = [];

    if (!productIds?.length) {
      return [];
    }

    try {
      const remConfig = await getRemConfig(subdomain, {
        stageId,
        pipelineId,
        posId,
        accountCodes,
        locationCodes,
      });
      if (!remConfig?.account || !remConfig?.location) {
        return [];
      }

      const configs = await getConfig(subdomain, 'ERKHET');

      const products = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'products',
        action: 'find',
        input: {
          query: { _id: { $in: productIds } },
          limit: productIds.length,
        },
        defaultValue: [],
      });

      const codes = (products || []).map((item) => item.code);

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
          timeout: 9000,
        },
      );

      const jsonRes = await response.json();
      let responseByCode = {};

      const accounts = remConfig.account.split(',') || [];
      const locations = remConfig.location.split(',') || [];

      for (const acc of accounts) {
        for (const loc of locations) {
          const resp = (jsonRes[acc] || {})[loc] || {};
          for (const invCode of Object.keys(resp)) {
            if (!Object.keys(responseByCode).includes(invCode)) {
              responseByCode[invCode] = { rem: 0, rems: [] };
            }
            const remainder = Number(resp[invCode]) || 0;

            responseByCode[invCode].rem =
              responseByCode[invCode].rem + remainder;
            responseByCode[invCode].rems.push({
              account: acc,
              location: loc,
              remainder,
            });
          }
        }
      }

      for (const r of products) {
        const resp = responseByCode[r.code] || {};

        result.push({
          _id: r._id,
          remainder: Number(resp.rem ?? 0),
          remainders: resp.rems ?? [],
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
      isMore,
    }: {
      contentType: string;
      contentId: string;
      startDate?: Date;
      endDate?: Date;
      isMore: boolean;
    },
    { subdomain }: IContext,
  ) {
    const result: any = {};

    try {
      const configs = await getConfig(subdomain, 'ERKHET');

      if (!configs || !Object.keys(configs).length) {
        return {};
      }

      if (!configs.debtAccounts) {
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
          const company = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'companies',
            action: 'findOne',
            input: { _id: contentId },
            defaultValue: {},
          });

          sendParams.customerCode = company && company.code;
          break;
        case 'user':
          const user = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'findOne',
            input: { _id: contentId },
            defaultValue: {},
          });

          sendParams.workerEmail = user && user.email;
          break;
        default:
          const customer = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'customers',
            action: 'findOne',
            input: { _id: contentId },
            defaultValue: {},
          });

          sendParams.customerCode = customer && customer.code;
      }

      if (!sendParams.customerCode && !sendParams.workerEmail) {
        return {};
      }

      const response = await fetch(
        configs.getRemainderApiUrl + '?' + new URLSearchParams(sendParams),
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
