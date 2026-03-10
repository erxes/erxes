import {
  ICampaign,
  IEngageMessageDocument,
  IScheduleDateDocument,
} from '@/broadcast/@types';
import {
  CAMPAIGN_KINDS,
  CAMPAIGN_METHODS,
  SES_DELIVERY_STATUSES,
} from '@/broadcast/constants';
import { getApi } from '@/broadcast/trackers';
import { getValueAsString } from '@/organization/settings/db/models/Configs';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import {
  EditorAttributeUtil,
  fetchEs,
  getEnv,
  getPlugins,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { EMAIL_VALIDATION_STATUSES } from '~/modules/contacts/constants';
import { generateCustomerSelector } from './engage';

export const isUsingElk = () => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });

  return ELK_SYNCER === 'false' ? false : true;
};

export interface IUser {
  name: string;
  position: string;
  email: string;
}

interface ICustomerAnalyzeParams {
  customers: ICustomerDocument[];
  engageMessageId: string;
}

interface IEngageParams {
  engageMessage: IEngageMessageDocument;
  customersSelector: any;
  user;
}

export const subscribeEngage = (models: IModels) => {
  return new Promise(async (resolve, reject) => {
    const snsApi = await getApi(models, 'sns');
    const sesApi = await getApi(models, 'ses');
    const configSet = await getValueAsString(
      models,
      'configSet',
      'AWS_SES_CONFIG_SET',
      'erxes',
    );

    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const topicArn = await snsApi
      .createTopic({ Name: configSet })
      .promise()
      .catch((e) => {
        console.log(e.message);

        return reject(e.message);
      });

    if (!topicArn) {
      return reject('Error occurred');
    }

    await snsApi
      .subscribe({
        TopicArn: topicArn.TopicArn,
        Protocol: 'https',
        Endpoint: `${DOMAIN}/gateway/pl:engages/service/engage/tracker`,
      })
      .promise()
      .then((response: Response) => {
        console.log(response);
      })
      .catch((e: Error) => {
        console.log(e.message);
        return reject(e.message);
      });

    await sesApi
      .createConfigurationSet({
        ConfigurationSet: {
          Name: configSet,
        },
      })
      .promise()
      .catch((e: Error) => {
        console.log(e.message);

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
            'renderingFailure',
          ],
          Name: configSet,
          Enabled: true,
          SNSDestination: {
            TopicARN: topicArn.TopicArn,
          },
        },
      })
      .promise()
      .catch((e: Error) => {
        console.log(e.message);

        if (e.message.includes('already exists')) {
          return;
        }

        return reject(e.message);
      });

    return resolve(true);
  });
};

export const updateConfigs = async (
  models: IModels,
  configsMap,
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
  { customers, engageMessageId }: ICustomerAnalyzeParams,
) => {
  const customerIds = customers.map((c) => c._id);
  const ignoredCustomerIds: string[] = [];

  const allowedEmailSkipLimit = await getConfig(
    models,
    'allowedEmailSkipLimit',
    '5',
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
            SES_DELIVERY_STATUSES.COMPLAINT,
          ],
        },
      },
    },
    {
      $group: { _id: '$customerId', count: { $sum: 1 } },
    },
  ]);

  for (const delivery of deliveries) {
    if (delivery.count > Number.parseInt(allowedEmailSkipLimit, 10)) {
      ignoredCustomerIds.push(delivery._id);
    }
  }

  if (ignoredCustomerIds.length > 0) {
    await models.Customers.updateSubscriptionStatus({
      customerIds: ignoredCustomerIds,
    });

    return {
      customers: customers.filter(
        (c) => ignoredCustomerIds.indexOf(c._id) === -1,
      ),
      ignoredCustomerIds,
    };
  }

  return { customers, ignoredCustomerIds };
};

const getAvgCondition = (fieldName: string) => ({
  $cond: [
    { $gt: [`$${fieldName}`, 0] },
    { $divide: [{ $multiply: [`$${fieldName}`, 100] }, '$total'] },
    0,
  ],
});

// Prepares average engage stats of email delivery stats
export const prepareAvgStats = (models: IModels) => {
  return models.Stats.aggregate([
    {
      $match: { total: { $gt: 0 } },
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
        pctSend: getAvgCondition('send'),
      },
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
        avgSendPercent: { $avg: '$pctSend' },
      },
    },
  ]);
};

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      console.log(e.message);

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
    const { validCustomersCount: currentValid = 0, totalCustomersCount = 0 } =
      campaign;
    const validSum = currentValid + validCustomersCount;

    await models.EngageMessages.updateOne(
      { _id },
      {
        $set: {
          // valid count must never exceed total count
          validCustomersCount:
            validSum > totalCustomersCount ? totalCustomersCount : validSum,
          lastRunAt: new Date(),
        },
        $inc: { runCount: 1 },
      },
    );
  }
};

export const getEditorAttributeUtil = async (subdomain: string) => {
  const services = await getPlugins();

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  const editor: any = await new EditorAttributeUtil(
    `${DOMAIN}/gateway/pl:core`,
    services,
    subdomain,
  );

  return editor;
};

export const getCustomerName = (customer) => {
  if (customer.firstName || customer.lastName) {
    return (customer.firstName || '') + ' ' + (customer.lastName || '');
  }

  if (customer.primaryEmail || customer.primaryPhone) {
    return customer.primaryEmail || customer.primaryPhone;
  }

  const { visitorContactInfo } = customer;

  if (visitorContactInfo) {
    return visitorContactInfo.phone || visitorContactInfo.email;
  }

  return 'Unknown';
};

export const getNumberOfVisits = async (params: {
  subdomain: string;
  url: string;
  visitorId?: string;
  customerId?: string;
}): Promise<number> => {
  const searchId = params.customerId
    ? { customerId: params.customerId }
    : { visitorId: params.visitorId };

  try {
    const response = await fetchEs({
      subdomain: params.subdomain,
      action: 'search',
      index: 'events',
      body: {
        query: {
          bool: {
            must: [
              { term: { name: 'viewPage' } },
              { term: searchId },
              {
                nested: {
                  path: 'attributes',
                  query: {
                    bool: {
                      must: [
                        {
                          term: {
                            'attributes.field': 'url',
                          },
                        },
                        {
                          match: {
                            'attributes.value': params.url,
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });

    const hits = response.hits.hits;

    if (hits.length === 0) {
      return 0;
    }

    const [firstHit] = hits;

    return firstHit._source.count;
  } catch (e) {
    console.log(`Error occurred during getNumberOfVisits ${e.message}`);
    return 0;
  }
};

export const timeCheckScheduledBroadcast = async (
  _id: string,
  models: IModels,
  scheduleDate?: IScheduleDateDocument,
) => {
  const isValidScheduledBroadcast =
    scheduleDate && scheduleDate.type === 'pre' && scheduleDate.dateTime;
  // Check for pre scheduled engages

  if (isValidScheduledBroadcast) {
    const dateTime = new Date(scheduleDate.dateTime || '');
    const now = new Date();
    const notRunNow = dateTime.getTime() > now.getTime();
    if (notRunNow) {
      // await models.Logs.createLog(
      //   _id,
      //   "regular",
      //   `Broadcast will run at "${dateTime.toLocaleString()}"`
      // );

      return true;
    }
  }
  return false;
};

const checkAlreadyRun = async (_id, kind, title, runCount, models: IModels) => {
  const isValid = kind === CAMPAIGN_KINDS.MANUAL;
  if (!isValid) return false;

  const isAlreadyRun = runCount && runCount > 0;

  if (isAlreadyRun) {
    // await models.Logs.createLog(
    //   _id,
    //   "regular",
    //   `Broadcast "${title}" has already run before`
    // );

    return true;
  }
  return false;
};

export const send = async (
  models: IModels,
  subdomain: string,
  engageMessage: IEngageMessageDocument,
  forceCreateConversation?: boolean,
) => {
  const { targetType, targetIds, fromUserId, _id, kind, runCount, title } =
    engageMessage;

  const user = await models.Users.findOne({ _id: fromUserId });

  if (!user) {
    throw new Error('User not found');
  }

  if (!engageMessage.isLive) {
    return;
  }

  const isAlreadyRun = await checkAlreadyRun(
    _id,
    kind,
    title,
    runCount,
    models,
  );

  if (isAlreadyRun) {
    return;
  }

  const customersSelector = await generateCustomerSelector(subdomain, models, {
    engageId: _id,
    targetType,
    targetIds,
  });

  if (engageMessage.method === CAMPAIGN_METHODS.EMAIL) {
    return sendEmailOrSms(
      models,
      subdomain,
      { engageMessage, customersSelector, user },
      'sendEngage',
    );
  }

  // if (engageMessage.method === CAMPAIGN_METHODS.SMS) {
  //   return sendEmailOrSms(
  //     models,
  //     subdomain,
  //     { engageMessage, customersSelector, user },
  //     'sendEngageSms',
  //   );
  // }

  // if (
  //   engageMessage.method === CAMPAIGN_METHODS.MESSENGER &&
  //   forceCreateConversation
  // ) {
  //   const brandId =
  //     (engageMessage.messenger && engageMessage.messenger.brandId) || '';

  //   const integrations = await sendTRPCMessage({
  //     subdomain,

  //     pluginName: 'frontline',
  //     method: 'query',
  //     module: 'integrations',
  //     action: 'find',
  //     input: {
  //       query: { brandId, kind: 'messenger' },
  //     },
  //   });

  //   if (integrations?.length === 0) {
  //     throw new Error("The Brand doesn't have Messenger Integration ");
  //   }

  //   if (integrations?.length > 1) {
  //     throw new Error('The Brand has multiple integrations');
  //   }

  //   const integration = integrations[0];

  //   if (!integration || !brandId) {
  //     throw new Error('Integration not found or brandId is not provided');
  //   }

  //   const erxesCustomers = await models.Customers.find(customersSelector);

  //   for (const customer of erxesCustomers || []) {
  //     await models.EngageMessages.createVisitorOrCustomerMessages({
  //       brandId,
  //       integrationId: integration._id,
  //       customer,
  //       visitorId: undefined,
  //       browserInfo: {},
  //     });
  //   }

  //   const receiversLength = erxesCustomers?.length || 0;

  //   if (receiversLength > 0) {
  //     await models.EngageMessages.updateOne(
  //       { _id: engageMessage._id },
  //       {
  //         $set: {
  //           totalCustomersCount: receiversLength,
  //         },
  //       },
  //     );
  //   }
  // }

  // if (engageMessage.method === CAMPAIGN_METHODS.NOTIFICATION) {
  //   return sendNotifications(models, subdomain, {
  //     engageMessage,
  //     customersSelector,
  //     user,
  //   });
  // }
};

export const prepareEngageCustomers = async (
  { Customers }: IModels,
  subdomain: string,
  { engageMessage, customersSelector, action, user },
): Promise<any> => {
  const customerInfos: Array<{
    _id: string;
    primaryEmail?: string;
    emailValidationStatus?: string;
    phoneValidationStatus?: string;
    primaryPhone?: string;
    replacers: Array<{ key: string; value: string }>;
  }> = [];

  const emailConf = engageMessage.email ? engageMessage.email : { content: '' };
  const emailContent = emailConf.content || '';

  const editorAttributeUtil = await getEditorAttributeUtil(subdomain);
  const customerFields = await editorAttributeUtil.getCustomerFields(
    emailContent,
  );

  const exists = { $exists: true, $nin: [null, '', undefined] };

  // Ensure email & phone are valid based on the engage message method
  if (engageMessage.method === 'email') {
    customersSelector.primaryEmail = exists;
    customersSelector.emailValidationStatus = EMAIL_VALIDATION_STATUSES.VALID;
  }
  if (engageMessage.method === 'sms') {
    customersSelector.primaryPhone = exists;
    customersSelector.phoneValidationStatus = EMAIL_VALIDATION_STATUSES.VALID;
  }

  const customersItemsMapping = JSON.parse('{}');

  // Define fields to include in customer queries
  const fieldsOption = {
    primaryEmail: 1,
    emailValidationStatus: 1,
    phoneValidationStatus: 1,
    primaryPhone: 1,
  };

  for (const field of customerFields || []) {
    fieldsOption[field] = 1;
  }

  const customersStream = (
    Customers.find(customersSelector, fieldsOption) as any
  ).cursor();
  const batchSize = 1000;
  let batch: Array<ICustomerDocument> = [];

  // Function to process each batch of customers
  const processCustomerBatch = async (batch: Array<ICustomerDocument>) => {
    const chunkCustomerInfos: Array<any> = [];

    for (const customer of batch) {
      const itemsMapping = customersItemsMapping[customer._id] || [null];

      for (const item of itemsMapping) {
        const replacers = await editorAttributeUtil.generateReplacers({
          content: emailContent,
          customer,
          item,
          customerFields,
        });

        chunkCustomerInfos.push({
          _id: customer._id,
          primaryEmail: customer.primaryEmail,
          emailValidationStatus: customer.emailValidationStatus,
          phoneValidationStatus: customer.phoneValidationStatus,
          primaryPhone: customer.primaryPhone,
          replacers,
        });
      }
    }

    customerInfos.push(...chunkCustomerInfos);

    // Send the engage message for each batch
    const data: any = {
      ...engageMessage,
      customers: chunkCustomerInfos,
      fromEmail: user.email,
      engageMessageId: engageMessage._id,
    };

    if (engageMessage.method === 'email' && engageMessage.email) {
      const replacedContent = await editorAttributeUtil.replaceAttributes({
        customerFields,
        content: emailContent,
        user,
      });

      engageMessage.email.content = replacedContent;
      data.email = engageMessage.email;
    }

    // TODO: uncomment
    // await sendEngagesMessage({
    //   subdomain,
    //   action: "notification",
    //   data: { action, data },
    // });
  };

  // Final steps to perform after all customers are processed
  const onFinishPiping = async () => {
    // TODO: uncomment
    // await sendEngagesMessage({
    //   subdomain,
    //   action: "pre-notification",
    //   data: { engageMessage, customerInfos },
    // });
    // You can perform any final actions here after processing all batches
  };

  // Stream processing using async iterator
  for await (const customer of customersStream) {
    batch.push(customer);

    if (batch.length >= batchSize) {
      await processCustomerBatch(batch);
      batch = []; // Reset the batch after processing
    }
  }

  // Process any remaining customers in the last batch
  if (batch.length > 0) {
    await processCustomerBatch(batch);
  }

  // Final actions after all data is processed
  await onFinishPiping();

  return { status: 'done', customerInfos };
};

const sendEmailOrSms = async (
  models: IModels,
  subdomain: string,
  { engageMessage, customersSelector, user }: IEngageParams,
  action: 'sendEngage' | 'sendEngageSms',
) => {
  prepareEngageCustomers(models, subdomain, {
    engageMessage,
    customersSelector,
    action,
    user,
  });
};

const sendCampaignNotification = async (
  models: IModels,
  subdomain: string,
  doc: any,
) => {
  const { groupId } = doc;
  try {
    // TODO: uncomment
    // await sendClientPortalMessage({
    //   subdomain,
    //   action: 'sendNotification',
    //   data: doc,
    //   isRPC: false,
    // }).then(async () => {
    //   await models.Logs.createLog(groupId, 'success', 'Notification sent');
    //   await models.EngageMessages.updateOne(
    //     { _id: groupId },
    //     { $inc: { runCount: 1 } },
    //   );
    // });
  } catch (e) {
    // await models.Logs.createLog(groupId, 'failure', e.message);
  }
};

const sendNotifications = async (
  models: IModels,
  subdomain: string,
  { engageMessage, customersSelector, user }: IEngageParams,
) => {
  const { notification, cpId } = engageMessage;
  const engageMessageId = engageMessage._id;

  const erxesCustomerIds = await models.Customers.find(
    customersSelector,
  ).distinct('_id');

  const cpUserIds = await models.CPUser.find({
    clientPortalId: cpId,
    erxesCustomerId: { $in: [...erxesCustomerIds] },
  }).distinct('_id');

  const doc = {
    createdUser: user,
    receivers: cpUserIds,
    title: notification?.title || '',
    content: notification?.content || '',
    notifType: 'engage',
    isMobile: notification?.isMobile || false,
    link: '',
    groupId: engageMessageId,
  };

  const receiversLength = doc.receivers.length || 0;

  if (receiversLength > 0) {
    await models.EngageMessages.updateOne(
      { _id: doc.groupId },
      {
        $set: {
          totalCustomersCount: receiversLength,
        },
      },
    );
  }

  await sendCampaignNotification(models, subdomain, doc);
};
