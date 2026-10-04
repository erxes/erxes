import { z } from 'zod';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { TelegramMessage } from '@/integrations/telegram/utils/message';
import { mongo } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramCustomerDocument } from '@/integrations/telegram/@types/customers';

const coreCustomerResponseSchema = z.object({
  _id: z.string().min(1),
});

export const createCoreCustomer = async (
  subdomain: string,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
): Promise<string> => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'get-create-update-customer',
    payload: JSON.stringify({
      integrationId,
      firstName: sender.first_name,
      lastName: sender.last_name,
      isUser: true,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(`Customer creation failed: ${response.errorMessage}`);
  }

  const customer = coreCustomerResponseSchema.safeParse(response.data);

  if (!customer.success) {
    throw new Error('Core did not return a valid customer ID');
  }

  return customer.data._id;
};

export const getOrCreateTelegramCustomer = async (
  models: IModels,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
): Promise<{
  customer: ITelegramCustomerDocument;
  created: boolean;
}> => {
  const userId = String(sender.id);
  let created = false;

  try {
    const result = await models.TelegramCustomers.updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          integrationId,
          firstName: sender.first_name,
          lastName: sender.last_name,
          username: sender.username,
        },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    created = result.upsertedCount === 1;
  } catch (error: unknown) {
    if (
      !(
        error instanceof mongo.MongoServerError &&
        error.code === 11000 &&
        error.keyPattern?.userId === 1
      )
    ) {
      throw error;
    }
  }

  return {
    customer: await models.TelegramCustomers.getCustomer({ userId }),
    created,
  };
};

const CUSTOMER_LINK_ATTEMPTS = 4;

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
  sender: NonNullable<TelegramMessage['from']>,
): Promise<ITelegramCustomerDocument> => {
  const result = await getOrCreateTelegramCustomer(
    models,
    integrationId,
    sender,
  );

  let customer = result.customer;

  if (!result.created) {
    for (let attempt = 1; attempt <= CUSTOMER_LINK_ATTEMPTS; attempt++) {
      if (customer.erxesApiId) {
        return customer;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 250 * attempt);
      });

      customer = await models.TelegramCustomers.getCustomer({
        _id: customer._id,
      });
    }
  }

  if (customer.erxesApiId) {
    return customer;
  }

  const erxesApiId = await createCoreCustomer(subdomain, integrationId, sender);

  const linkedCustomer = await models.TelegramCustomers.findOneAndUpdate(
    { _id: customer._id, erxesApiId: null },
    { $set: { erxesApiId } },
    { new: true, runValidators: true },
  );

  if (linkedCustomer) {
    return linkedCustomer;
  }

  const currentCustomer = await models.TelegramCustomers.getCustomer({
    _id: customer._id,
  });

  if (!currentCustomer.erxesApiId) {
    throw new Error('Telegram customer could not be linked to a Core contact');
  }

  return currentCustomer;
};
