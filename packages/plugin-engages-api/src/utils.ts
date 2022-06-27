import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';

import EditorAttributeUtil from '@erxes/api-utils/src/editorAttributeUtils';

import { SES_DELIVERY_STATUSES } from './constants';
import { debugBase, debugError } from './debuggers';
import messageBroker, { sendContactsMessage } from './messageBroker';
import { ISESConfig } from './models/Configs';
import { getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { getApi } from './trackers/engageTracker';
import { ICampaign, ICustomer } from './types';
import { IModels } from './connectionResolver';

export const isUsingElk = () => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  return ELK_SYNCER === 'false' ? false : true;
};

export const createTransporter = async (models: IModels) => {
  const config: ISESConfig = await models.Configs.getSESConfigs();

  AWS.config.update(config);

  return nodemailer.createTransport({
    SES: new AWS.SES({ apiVersion: '2010-12-01' })
  });
};

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

export const subscribeEngage = (models: IModels) => {
  return new Promise(async (resolve, reject) => {
    const snsApi = await getApi(models, 'sns');
    const sesApi = await getApi(models, 'ses');
    const configSet = await getConfig(models, 'configSet', 'erxes');

    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const topicArn = await snsApi
      .createTopic({ Name: configSet })
      .promise()
      .catch(e => {
        debugError(e.message);

        return reject(e.message);
      });

    if (!topicArn) {
      return reject('Error occured');
    }

    await snsApi
      .subscribe({
        TopicArn: topicArn.TopicArn,
        Protocol: 'https',
        Endpoint: `${DOMAIN}/gateway/pl:engages/service/engage/tracker`
      })
      .promise()
      .then(response => {
        debugBase(response);
      })
      .catch(e => {
        debugError(e.message);

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
        debugError(e.message);

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
        debugError(e.message);

        if (e.message.includes('already exists')) {
          return;
        }

        return reject(e.message);
      });

    return resolve(true);
  });
};

export const getValueAsString = async (models: IModels, name: string) => {
  const entry = await models.Configs.getConfig(name);

  if (entry.value) {
    return entry.value.toString();
  }

  return entry.value;
};

export const updateConfigs = async (
  models: IModels,
  configsMap
): Promise<void> => {
  const prevSESConfigs = await models.Configs.getSESConfigs();

  await models.Configs.updateConfigs(configsMap);

  const updatedSESConfigs = await models.Configs.getSESConfigs();

  if (JSON.stringify(prevSESConfigs) !== JSON.stringify(updatedSESConfigs)) {
    await subscribeEngage(models);
  }
};

export const getConfigs = async (models: IModels): Promise<any> => {
  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  return configsMap;
};

export const getConfig = async (models: IModels, code, defaultValue?) => {
  const configs = await getConfigs(models);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const cleanIgnoredCustomers = async (
  subdomain: string,
  models: IModels,
  { customers, engageMessageId }: ICustomerAnalyzeParams
) => {
  const customerIds = customers.map(c => c._id);
  const ignoredCustomerIds: string[] = [];

  const allowedEmailSkipLimit = await getConfig(
    models,
    'allowedEmailSkipLimit',
    '5'
  );

  /**
   * gather customers who did not complain, open or click previously &
   * no errors occurred
   */
  const deliveries = await models.DeliveryReports.aggregate([
    {
      $match: {
        engageMessageId: { $ne: engageMessageId },
        customerId: { $in: customerIds },
        status: {
          $nin: [
            SES_DELIVERY_STATUSES.OPEN,
            SES_DELIVERY_STATUSES.CLICK,
            SES_DELIVERY_STATUSES.RENDERING_FAILURE,
            SES_DELIVERY_STATUSES.REJECT,
            SES_DELIVERY_STATUSES.COMPLAINT
          ]
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
    sendContactsMessage({
      subdomain,
      isRPC: false,
      action: 'customers.setUnsubscribed',
      data: { customerIds: ignoredCustomerIds }
    });

    return {
      customers: customers.filter(
        c => ignoredCustomerIds.indexOf(c._id) === -1
      ),
      ignoredCustomerIds
    };
  }

  return { customers, ignoredCustomerIds };
};

const getAvgCondition = (fieldName: string) => ({
  $cond: [
    { $gt: [`$${fieldName}`, 0] },
    { $divide: [{ $multiply: [`$${fieldName}`, 100] }, '$total'] },
    0
  ]
});

// Prepares average engage stats of email delivery stats
export const prepareAvgStats = (models: IModels) => {
  return models.Stats.aggregate([
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

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      debugError(e.message);

      if (callback) {
        return callback(res, e);
      }

      return next(e);
    }
  };
};

export const setCampaignCount = async (models: IModels, data: ICampaign) => {
  const { _id, validCustomersCount = 0 } = data;

  const campaign = await models.EngageMessages.findOne({ _id });

  if (campaign) {
    const {
      validCustomersCount: currentValid = 0,
      totalCustomersCount = 0
    } = campaign;
    const validSum = currentValid + validCustomersCount;

    await models.EngageMessages.updateOne(
      { _id },
      {
        $set: {
          // valid count must never exceed total count
          validCustomersCount:
            validSum > totalCustomersCount ? totalCustomersCount : validSum,
          lastRunAt: new Date()
        },
        $inc: { runCount: 1 }
      }
    );
  }
};

export const getEditorAttributeUtil = async (subdomain: string) => {
  const services = await getServices();
  const editor = await new EditorAttributeUtil(
    messageBroker(),
    `${process.env.DOMAIN}/gateway/pl:core`,
    services,
    subdomain
  );

  return editor;
};
