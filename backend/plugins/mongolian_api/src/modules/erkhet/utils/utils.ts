import { sendTRPCMessage } from 'erxes-api-shared/utils';
import fetch from 'node-fetch';

// Send data to Erkhet plugin
export const toErkhet = async (models, syncLog, config, sendData, action) => {
  const postData = {
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(sendData),
  };

  /*sendRPCMessage(models, syncLog, "rpc_queue:erxes-automation-erkhet", {
    action,
    payload: JSON.stringify(postData),
    thirdService: true
  });*/
};

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getConfig = async (
  subdomain: string,
  code: string,
  defaultValue?: any,
) => {
  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfig',
    input: { code, defaultValue },
    defaultValue,
  });
};

export const sendCardInfo = async (subdomain, deal, config, value) => {
  const field = config.responseField.replace('customFieldsData.', '');

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'deals',
    method: 'mutation',
    action: 'updateOne',
    input: {
      selector: { _id: deal._id },
      modifier: { $pull: { customFieldsData: { field } } },
    },
    defaultValue: {},
  });

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'deals',
    method: 'mutation',
    action: 'updateOne',
    input: {
      selector: { _id: deal._id },
      modifier: {
        $push: {
          customFieldsData: {
            field,
            value,
            stringValue: value,
          },
        },
      },
    },
    defaultValue: {},
  });
};

export const getCompanyInfo = async ({
  checkTaxpayerUrl,
  no,
}: {
  checkTaxpayerUrl: string;
  no: string;
}) => {
  const tinre = /(^\d{11}$)|(^\d{12}$)|(^\d{14}$)/;
  if (tinre.test(no)) {
    const result = await fetch(
      // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
      `${checkTaxpayerUrl}/getInfo?tin=${no}`,
    ).then((r) => r.json());

    return { status: 'checked', result, tin: no };
  }

  const re = /(^[А-ЯЁӨҮ]{2}\d{8}$)|(^\d{7}$)/giu;

  if (!re.test(no)) {
    return { status: 'notValid' };
  }

  const info = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${rd}`
    `${checkTaxpayerUrl}/getTinInfo?regNo=${no}`,
  ).then((r) => r.json());

  if (info?.status !== 200) {
    return { status: 'notValid' };
  }

  const tinNo = info.data;

  const result = await fetch(
    // `https://api.ebarimt.mn/api/info/check/getInfo?tin=${tinNo}`
    `${checkTaxpayerUrl}/getInfo?tin=${tinNo}`,
  ).then((r) => r.json());

  return { status: 'checked', result, tin: tinNo };
};

export const getRemConfig = async (
  subdomain: string,
  {
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
) => {
  if (stageId || pipelineId) {
    if (!pipelineId) {
      const pipeline = await sendTRPCMessage({
        subdomain,
        pluginName: 'sales',
        method: 'query',
        module: 'sales',
        action: 'pipeline.findOne',
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
      pluginName: 'sales',
      method: 'query',
      module: 'pos',
      action: 'configs.findOne',
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
