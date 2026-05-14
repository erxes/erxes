import { ICustomer, ICustomerDocument } from 'erxes-api-shared/core-types';
import { getEnv } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import validator from 'validator';
import { IModels } from '~/connectionResolvers';
import { EMAIL_VALIDATION_STATUSES } from '~/modules/contacts/constants';
import { getValueAsString } from '~/modules/organization/settings/db/models/Configs';
import { IEngageMessageDocument } from '../@types';
import { addBroadcastWorkerQueue } from './worker';

const CUSTOMER_BATCH_SIZE = 1000;

const countAllCustomers = ({
  models,
  targetType,
  targetIds,
}: {
  models: IModels;
  targetType: string;
  targetIds: string[];
}) => {
  const query: FilterQuery<ICustomer> = {};

  if (targetType === 'tag') {
    query.tagIds = { $in: targetIds };
  }

  return models.Customers.countDocuments(query);
};

const traceExcludedCustomers = async ({
  models,
  targetType,
  targetIds,
  engageMessageId,
}: {
  models: IModels;
  targetType: string;
  targetIds: string[];
  engageMessageId: string;
}) => {
  const query: FilterQuery<ICustomer> = {
    $or: [
      { primaryEmail: { $in: [null, '', undefined] } },
      { primaryEmail: { $exists: false } },
      {
        primaryEmail: { $exists: true, $nin: [null, '', undefined] },
        emailValidationStatus: { $nin: [EMAIL_VALIDATION_STATUSES.VALID] },
      },
      { isSubscribed: 'No' },
    ],
  };

  if (targetType === 'tag') {
    query.tagIds = { $in: targetIds };
  }

  const cursor = models.Customers.find(query, { _id: 1, primaryEmail: 1, emailValidationStatus: 1, isSubscribed: 1 })
    .batchSize(CUSTOMER_BATCH_SIZE)
    .lean();

  for await (const customer of cursor) {
    let reason: string;

    if (!customer.primaryEmail) {
      reason = 'no email address';
    } else if (customer.isSubscribed === 'No') {
      reason = 'unsubscribed';
    } else {
      reason = `email validation status is "${customer.emailValidationStatus || 'not validated'}"`;
    }

    await models.BroadcastTraces.createTrace(
      engageMessageId,
      'regular',
      `Skipped customer ${customer._id}: ${reason} (${customer.primaryEmail || 'none'})`,
    );
  }
};

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

  if (!fromUser?.email) {
    throw new Error('Invalid from user');
  }

  const configSet = await getValueAsString(
    models,
    'BROADCAST_AWS_SES_CONFIG_SET',
    'AWS_SES_CONFIG_SET',
    'erxes',
  );

  await models.EngageMessages.updateOne(
    { _id },
    {
      $set: {
        status: 'sending',
        'progress.processedBatches': 0,
        'progress.totalBatches': 0,
        'progress.successCount': 0,
        'progress.failureCount': 0,
        'progress.lastUpdated': new Date(),
      },
    },
  );

  // Collect all batches before queuing so totalBatches is known upfront.
  // Workers check processedBatches >= totalBatches to set final status,
  // so totalBatches must be written before any worker can finish.
  const totalCustomersCount = await countAllCustomers({
    models,
    targetType,
    targetIds,
  });

  await traceExcludedCustomers({ models, targetType, targetIds, engageMessageId: _id });

  const batches: ICustomerDocument[][] = [];
  let currentBatch: ICustomerDocument[] = [];

  for await (const customer of prepareCustomers({
    models,
    targetType,
    targetIds,
  })) {
    if (!customer || !validator.isEmail(customer?.primaryEmail || '')) {
      await models.BroadcastTraces.createTrace(
        _id,
        'regular',
        `Skipped customer ${customer?._id}: missing or invalid email (${customer?.primaryEmail || 'none'})`,
      );
      continue;
    }

    const delivery = await models.DeliveryReports.findOne({
      engageMessageId: _id,
      email: customer.primaryEmail,
    });

    if (delivery) {
      await models.BroadcastTraces.createTrace(
        _id,
        'regular',
        `Skipped customer ${customer._id}: email ${customer.primaryEmail} already sent in a previous run`,
      );
      continue;
    }

    currentBatch.push(customer);

    if (currentBatch.length >= CUSTOMER_BATCH_SIZE) {
      batches.push(currentBatch);
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  // Write totalBatches BEFORE queuing so workers always see the correct value
  await models.EngageMessages.updateOne(
    { _id },
    {
      $set: {
        lastRunAt: new Date(),
        totalCustomersCount,
        'progress.totalBatches': batches.length,
      },
      $inc: {
        runCount: 1,
      },
    },
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    addBroadcastWorkerQueue({
      queueName: 'broadcast_processor',
      data: {
        method,
        payload: {
          customers: batches[batchIndex],
          engageMessage,
          fromEmail: fromUser.email,
          configSet,
          subdomain,
        },
      },
      jobId: `${_id}_batch_${batchIndex}`,
    });
  }
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
