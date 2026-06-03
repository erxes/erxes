import { sendTRPCMessage } from 'erxes-api-shared/utils';
import fetch from 'node-fetch';
import { generateModels, IModels } from '~/connectionResolvers';
import { ISyncLogDocument } from '../@types';

const getErkhetUrl = () => {
  const url = process.env.ERKHET_URL;

  if (!url) {
    throw new Error('ERKHET_URL env is not configured');
  }

  return url.replace(/\/+$/, '');
};

const getErkhetMessageUrl = () => {
  const url = getErkhetUrl();

  if (url.endsWith('/api/message')) {
    return `${url}/`;
  }

  if (url.endsWith('/api/message/')) {
    return url;
  }

  return `${url}/api/message/`;
};

const parseErkhetResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (_e) {
    // text is not valid JSON, so return it as-is
    return text;
  }
};

const getErkhetResponseMessage = (responseData) => {
  if (!responseData || typeof responseData !== 'object') {
    return '';
  }

  return responseData?.message || responseData?.data?.message || '';
};

const getErkhetErrorMessage = (response, responseData) =>
  getErkhetResponseMessage(responseData) ||
  responseData?.error ||
  responseData?.data?.error ||
  responseData?.statusText ||
  response.statusText ||
  `Erkhet request failed with status ${response.status}`;

const buildErkhetFormBody = (body: Record<string, any>) => {
  const formBody = new URLSearchParams();

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) {
      continue;
    }

    formBody.set(
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  }

  return formBody;
};

const stripHtml = (value = '') =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractDjangoError = (responseStr = '') => {
  const title = responseStr.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const exceptionValue = responseStr.match(
    /<pre class="exception_value">([\s\S]*?)<\/pre>/i,
  )?.[1];
  const exceptionType = responseStr.match(
    /<th>Exception Type:<\/th>\s*<td>([\s\S]*?)<\/td>/i,
  )?.[1];
  const exceptionLocation = responseStr.match(
    /<th>Exception Location:<\/th>\s*<td>([\s\S]*?)<\/td>/i,
  )?.[1];

  return {
    title: stripHtml(title),
    exceptionType: stripHtml(exceptionType),
    exceptionValue: stripHtml(exceptionValue),
    exceptionLocation: stripHtml(exceptionLocation),
  };
};

export const sendErkhetPost = async (
  models: IModels,
  action: string,
  payload: any,
  syncLog?: ISyncLogDocument,
) => {
  const body = {
    action,
    isEbarimt: false,
    payload: JSON.stringify(payload),
    isJson: true,
    thirdService: true,
  };
  const sendData = { action, payload: body };
  const requestUrl = getErkhetMessageUrl();

  if (syncLog) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          sendData,
          sendStr: JSON.stringify(sendData),
          requestUrl,
        },
      },
    );
  }

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildErkhetFormBody(body),
  });

  const responseData = await parseErkhetResponse(response);
  const responseStr =
    typeof responseData === 'string'
      ? responseData
      : JSON.stringify(responseData);

  const hasErkhetError =
    !response.ok ||
    responseData?.error ||
    responseData?.data?.error ||
    getErkhetResponseMessage(responseData);

  const error = hasErkhetError
    ? getErkhetErrorMessage(response, responseData)
    : undefined;

  if (syncLog) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      {
        $set: {
          responseData,
          responseStr,
          ...(error ? { error } : {}),
        },
      },
    );
  }

  if (error) {
    return {
      ...(typeof responseData === 'object'
        ? responseData
        : { message: responseData }),
      error,
      status: response.status,
      requestUrl,
    };
  }

  return responseData;
};

export const sendErkhetGet = async (
  path: string,
  params: Record<string, string>,
) => {
  const url = new URL(`${getErkhetUrl()}/${path.replace(/^\/+/, '')}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  const responseData = await parseErkhetResponse(response);

  if (!response.ok) {
    return {
      ...(typeof responseData === 'object'
        ? responseData
        : { message: responseData }),
      error: getErkhetErrorMessage(response, responseData),
      status: response.status,
      requestUrl: url.toString(),
    };
  }

  return responseData;
};

// Send data to Erkhet plugin
export const toErkhet = async (
  models: IModels,
  config: any,
  sendData: any,
  action: string,
  syncLog?: ISyncLogDocument,
) => {
  const postData = {
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(sendData),
  };

  return sendErkhetPost(models, action, postData, syncLog);
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
  const models = await generateModels(subdomain);
  const config = await models.Configs.getConfig(code, '');

  if (config) {
    return config.value;
  }

  const configs = await models.Configs.getConfigs(code);

  if (configs?.length) {
    return configs.reduce((acc, conf) => {
      acc[conf.subId || ''] = conf.value;
      return acc;
    }, {});
  }

  return defaultValue ?? null;
};

export const sendCardInfo = async (subdomain, deal, config, value) => {
  const field = config.responseField.replace('propertiesData.', '');

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'deal',
    method: 'mutation',
    action: 'updateOne',
    input: {
      selector: { _id: deal._id },
      modifier: {
        $set: {
          [`propertiesData.${field}`]: value,
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
        module: 'pipeline',
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
    const models = await generateModels(subdomain);
    const posErkhetConfig =
      (await models.Configs.getConfigValue(
        'posOrderErkhetConfig',
        posId,
        {},
      )) || {};

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
