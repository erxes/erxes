import { getConfig, getRemConfig } from '@/erkhet/utils';
import { getPureDate, sendTRPCMessage } from 'erxes-api-shared/src/utils';
import fetch from 'node-fetch';
import { IContext } from '~/connectionResolvers';

const erkhetQueries = {
  async erkhetRemainders(
    _root: undefined,
    {
      productIds,
      stageId,
      pipelineId,
      posId,
      accountCodes,
      locationCodes,
    }: {
      stageId?: string;
      pipelineId?: string;
      posId?: string;
      accountCodes?: string;
      locationCodes?: string;
      productIds?: string[];
    },
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
    _root: undefined,
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
