import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendCommonMessage } from './messageBroker';
import { IRecording } from './models';

export const getDailyData = async subdomain => {
  const keys = ['DAILY_API_KEY', 'DAILY_END_POINT'];

  const selector = { code: { $in: keys } };

  const configs = await sendCommonMessage({
    serviceName: 'integrations',
    action: 'configs.find',
    subdomain,
    data: { selector },
    isRPC: true
  });

  if (!configs || configs.length === 0) {
    throw new Error(
      'Video call configs not found. Please setup video call configs from integrations settings.'
    );
  }

  const DAILY_API_KEY = configs.find(
    (config: any) => config.code === 'DAILY_API_KEY'
  ).value;

  const response = await sendRequest({
    url: 'https://api.daily.co/v1',
    method: 'get',
    headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
  });

  if (!response) {
    throw new Error(
      'Error while fetching video call usage status. Please try again later.'
    );
  }

  if (response.error) {
    if (response.error === 'authentication-error') {
      throw new Error(
        'Invalid daily api key. Please check your daily api key.'
      );
    }

    throw new Error(response.error);
  }

  return response;
};

export const sendDailyRequest = async (
  url: string,
  method: string,
  body = {},
  subdomain: string
) => {
  const data = await getDailyData(subdomain);

  const domain_name = data.domain_name;

  const api_key = await sendCommonMessage({
    serviceName: 'integrations',
    action: 'configs.findOne',
    subdomain,
    data: { code: 'DAILY_API_KEY' },
    isRPC: true
  });

  try {
    const res = await sendRequest({
      url: `https://${domain_name}.daily.co${url}`,
      method,
      headers: { Authorization: `Bearer ${api_key.value}` },
      body
    });

    return {
      ...res,
      domain_name
    };
  } catch (e) {
    return e;
  }
};

export const isAfter = (
  expiresTimestamp: number,
  defaultMillisecond?: number
) => {
  const millisecond = defaultMillisecond || new Date().getTime();
  const expiresMillisecond = new Date(expiresTimestamp * 1000).getTime();

  if (expiresMillisecond > millisecond) {
    return true;
  }

  return false;
};

export const getRecordings = async (
  subdomain: string,
  recordings: IRecording[]
) => {
  const newRecordings: IRecording[] = [];

  for (const record of recordings) {
    if (!record.expires || (record.expires && !isAfter(record.expires))) {
      const accessLinkResponse = await sendDailyRequest(
        `/api/v1/recordings/${record.id}/access-link`,
        'GET',
        {},
        subdomain
      );

      record.expires = accessLinkResponse.expires;
      record.url = accessLinkResponse.download_link;
    }

    newRecordings.push(record);
  }

  return newRecordings;
};
