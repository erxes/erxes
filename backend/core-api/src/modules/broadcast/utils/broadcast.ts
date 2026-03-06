import { ICustomer, ICustomerDocument } from 'erxes-api-shared/core-types';
import { FilterQuery } from 'mongoose';
import validator from 'validator';
import { IModels } from '~/connectionResolvers';
import { EMAIL_VALIDATION_STATUSES } from '~/modules/contacts/constants';
import { getValueAsString } from '~/modules/organization/settings/db/models/Configs';
import { IEngageMessageDocument } from '../@types';
import { addBroadcastWorkerQueue } from './worker';

const CUSTOMER_BATCH_SIZE = 1000;

const prepareCustomers = ({
  models,
  targetType,
  targetIds,
}: {
  models: IModels;
  targetType: string;
  targetIds: string[];
}) => {
  const query: FilterQuery<ICustomer> = {
    primaryEmail: { $exists: true, $nin: [null, '', undefined] },
    emailValidationStatus: EMAIL_VALIDATION_STATUSES.VALID,
    $or: [{ isSubscribed: 'Yes' }, { isSubscribed: { $exists: false } }],
  };

  if (targetType === 'tag') {
    query.tagIds = { $in: targetIds };
  }

  return models.Customers.find(query).batchSize(CUSTOMER_BATCH_SIZE).lean();
};

const sendBroadcastEmail = async ({
  models,
  subdomain,
  engageMessage,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
}) => {
  const { _id, targetType, targetIds, method, fromUserId } = engageMessage;

  const fromUser = await models.Users.findOne({ _id: fromUserId }).lean();

  if (!fromUser || !fromUser?.email) {
    throw new Error('Invalid from user');
  }

  const configSet = await getValueAsString(
    models,
    'BROADCAST_AWS_SES_CONFIG_SET',
    'BROADCAST_AWS_SES_CONFIG_SET',
    'erxes',
  );

  await models.EngageMessages.updateOne(
    { _id },
    {
      $set: {
        status: 'sending',
        'progress.processedBatches': 0,
        'progress.successCount': 0,
        'progress.failureCount': 0,
        'progress.lastUpdated': new Date(),
      },
    },
  );

  let customers: ICustomerDocument[] = [];

  let batchIndex = 0;

  const STATS = { totalCustomersCount: 0, totalBatches: 0 };

  for await (const customer of prepareCustomers({
    models,
    targetType,
    targetIds,
  })) {
    STATS.totalCustomersCount++;

    if (!customer || !validator.isEmail(customer?.primaryEmail || '')) {
      continue;
    }

    const delivery = await models.DeliveryReports.findOne({
      engageMessageId: _id,
      email: customer.primaryEmail,
    });

    if (delivery) {
      continue;
    }

    customers.push(customer);

    if (customers.length >= CUSTOMER_BATCH_SIZE) {
      STATS.totalBatches++;

      addBroadcastWorkerQueue({
        queueName: 'broadcast_processor',
        data: {
          method,
          payload: {
            customers,
            engageMessage,
            fromEmail: fromUser.email,
            configSet,
            subdomain,
          },
        },
        jobId: `${_id}_batch_${batchIndex++}`,
      });

      customers = [];
    }
  }

  if (customers.length > 0) {
    STATS.totalBatches++;

    addBroadcastWorkerQueue({
      queueName: 'broadcast_processor',
      data: {
        method,
        payload: {
          customers,
          engageMessage,
          fromEmail: fromUser.email,
          subdomain,
        },
      },
      jobId: `${_id}_batch_${batchIndex}`,
    });
  }

  await models.EngageMessages.updateOne(
    { _id },
    {
      $set: {
        lastRunAt: new Date(),
        totalCustomersCount: STATS.totalCustomersCount,
        'progress.totalBatches': STATS.totalBatches,
      },
      $inc: {
        runCount: 1,
      },
    },
  );
};

export const sendBroadcast = async ({
  models,
  subdomain,
  engageMessage,
}: {
  models: IModels;
  subdomain: string;
  engageMessage: IEngageMessageDocument;
}) => {
  const { method } = engageMessage;

  if (method === 'email') {
    return sendBroadcastEmail({ models, subdomain, engageMessage });
  }
};
