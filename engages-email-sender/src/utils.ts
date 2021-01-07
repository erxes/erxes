import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { SES_DELIVERY_STATUSES } from './constants';
import { debugBase } from './debuggers';
import messageBroker from './messageBroker';
import Configs, { ISESConfig } from './models/Configs';
import { DeliveryReports, Stats } from './models/index';
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

interface ICustomerAnalyzeParams {
  customers: ICustomer[];
  engageMessageId: string;
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

export const cleanIgnoredCustomers = async ({
  customers,
  engageMessageId
}: ICustomerAnalyzeParams) => {
  const customerIds = customers.map(c => c._id);
  const ignoredCustomerIds: string[] = [];

  const allowedEmailSkipLimit = await getConfig('allowedEmailSkipLimit', '5');

  // gather customers who did not open or click previously
  const deliveries = await DeliveryReports.aggregate([
    {
      $match: {
        engageMessageId: { $ne: engageMessageId },
        customerId: { $in: customerIds },
        status: {
          $nin: [SES_DELIVERY_STATUSES.OPEN, SES_DELIVERY_STATUSES.CLICK]
        }
      }
    },
    {
      $group: { _id: '$customerId', count: { $sum: 1 } }
    }
  ]);

  for (const delivery of deliveries) {
    if (delivery.count > parseInt(allowedEmailSkipLimit, 10)) {
      ignoredCustomerIds.push(delivery._id);
    }
  }

  if (ignoredCustomerIds.length > 0) {
    await messageBroker().sendMessage('engagesNotification', {
      action: 'setDoNotDisturb',
      data: { customerIds: ignoredCustomerIds }
    });

    return customers.filter(c => ignoredCustomerIds.indexOf(c._id) === -1);
  }

  return customers;
};

const getAvgCondition = (fieldName: string) => ({
  $cond: [
    { $gt: [`$${fieldName}`, 0] },
    { $divide: [{ $multiply: [`$${fieldName}`, 100] }, '$total'] },
    0
  ]
});

// Prepares average engage stats of email delivery stats
export const prepareAvgStats = () => {
  return Stats.aggregate([
    {
      $match: { total: { $gt: 0 } }
    },
    {
      $project: {
        createdAt: '$createdAt',
        engageMessageId: '$engageMessageId',
        pctBounce: getAvgCondition('bounce'),
        pctClick: getAvgCondition('click'),
        pctComplaint: getAvgCondition('complaint'),
        pctDelivery: getAvgCondition('delivery'),
        pctOpen: getAvgCondition('open'),
        pctReject: getAvgCondition('reject'),
        pctRenderingFailure: getAvgCondition('renderingfailure'),
        pctSend: getAvgCondition('send')
      }
    },
    {
      $group: {
        _id: null,
        avgBouncePercent: { $avg: '$pctBounce' },
        avgComplaintPercent: { $avg: '$pctComplaint' },
        avgClickPercent: { $avg: '$pctClick' },
        avgDeliveryPercent: { $avg: '$pctDelivery' },
        avgOpenPercent: { $avg: '$pctOpen' },
        avgRejectPercent: { $avg: '$pctReject' },
        avgRenderingFailurePercent: { $avg: '$pctRenderingFailure' },
        avgSendPercent: { $avg: '$pctSend' }
      }
    }
  ]);
};
