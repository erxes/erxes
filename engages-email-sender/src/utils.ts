import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { debugBase } from './debuggers';
import Configs, { ISESConfig } from './models/Configs';
import { getApi } from './trackers/engageTracker';

export const createTransporter = async () => {
  const config: ISESConfig = await Configs.getSESConfigs();

  AWS.config.update(config);

  return nodemailer.createTransport({
    SES: new AWS.SES({ apiVersion: '2010-12-01' })
  });
};

export interface ICustomer {
  _id: string;
  primaryEmail: string;
  emailValidationStatus: string;
  primaryPhone: string;
  phoneValidationStatus: string;
  replacers: Array<{ key: string; value: string }>;
}

export interface IUser {
  name: string;
  position: string;
  email: string;
}

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

export const subscribeEngage = () => {
  return new Promise(async (resolve, reject) => {
    const snsApi = await getApi('sns');
    const sesApi = await getApi('ses');
    const configSet = await getConfig('configSet', 'erxes');

    const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });

    const topicArn = await snsApi
      .createTopic({ Name: configSet })
      .promise()
      .catch(e => {
        return reject(e.message);
      });

    if (!topicArn) {
      return reject('Error occured');
    }

    await snsApi
      .subscribe({
        TopicArn: topicArn.TopicArn,
        Protocol: 'https',
        Endpoint: `${MAIN_API_DOMAIN}/service/engage/tracker`
      })
      .promise()
      .then(response => {
        debugBase(response);
      })
      .catch(e => {
        return reject(e.message);
      });

    await sesApi
      .createConfigurationSet({
        ConfigurationSet: {
          Name: configSet
        }
      })
      .promise()
      .catch(e => {
        if (e.message.includes('already exists')) {
          return;
        }

        return reject(e.message);
      });

    await sesApi
      .createConfigurationSetEventDestination({
        ConfigurationSetName: configSet,
        EventDestination: {
          MatchingEventTypes: [
            'send',
            'reject',
            'bounce',
            'complaint',
            'delivery',
            'open',
            'click',
            'renderingFailure'
          ],
          Name: configSet,
          Enabled: true,
          SNSDestination: {
            TopicARN: topicArn.TopicArn
          }
        }
      })
      .promise()
      .catch(e => {
        if (e.message.includes('already exists')) {
          return;
        }

        return reject(e.message);
      });

    return resolve(true);
  });
};

export const getValueAsString = async name => {
  const entry = await Configs.getConfig(name);

  if (entry.value) {
    return entry.value.toString();
  }

  return entry.value;
};

export const updateConfigs = async (configsMap): Promise<void> => {
  const prevSESConfigs = await Configs.getSESConfigs();

  await Configs.updateConfigs(configsMap);

  const updatedSESConfigs = await Configs.getSESConfigs();

  if (JSON.stringify(prevSESConfigs) !== JSON.stringify(updatedSESConfigs)) {
    await subscribeEngage();
  }
};

export const getConfigs = async (): Promise<any> => {
  const configsMap = {};
  const configs = await Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (code, defaultValue?) => {
  const configs = await getConfigs();

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};
