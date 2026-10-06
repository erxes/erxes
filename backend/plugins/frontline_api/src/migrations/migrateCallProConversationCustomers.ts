import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  DRY_RUN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const isDryRun = DRY_RUN !== 'false';
const BATCH_SIZE = 500;
const BACKUP_COLLECTION = 'conversations_bak_callpro_customers';

interface IStringIdDocument {
  _id: string;
}

interface IConversationDocument extends IStringIdDocument {
  customerId?: string | null;
  callProPhone?: string;
  callProPotentialCustomerIds?: string[];
}

interface ICallProConversationDocument extends IStringIdDocument {
  erxesApiId?: string;
  recipientPhoneNumber?: string;
}

interface ICallProCustomerDocument extends IStringIdDocument {
  phoneNumber?: string;
  erxesApiId?: string | null;
}

interface ICustomerDocument extends IStringIdDocument {
  primaryPhone?: string;
  phones?: { phone?: string }[];
}

const client = new MongoClient(MONGO_URL);

const unique = <T>(values: T[]): T[] => [...new Set(values)];

const migrate = async () => {
  await client.connect();
  const db = client.db();

  const Integrations = db.collection<IStringIdDocument & { kind?: string }>(
    'integrations',
  );
  const Conversations = db.collection<IConversationDocument>('conversations');
  const CallProConversations = db.collection<ICallProConversationDocument>(
    'conversations_callpros',
  );
  const CallProCustomers =
    db.collection<ICallProCustomerDocument>('customers_callpros');
  const Customers = db.collection<ICustomerDocument>('customers');

  console.log(isDryRun ? '** DRY RUN — no writes **' : '** APPLY **');

  const integrationIds = await Integrations.distinct('_id', {
    kind: 'callpro',
  });

  const conversationIds: string[] = await Conversations.distinct('_id', {
    integrationId: { $in: integrationIds },
    customerId: { $in: [null, ''] },
  });

  console.log(
    `CallPro conversations without customer: ${conversationIds.length}`,
  );

  if (!conversationIds.length) {
    return;
  }

  const phoneByConversationId = new Map<string, string>();

  for await (const call of CallProConversations.find(
    { erxesApiId: { $in: conversationIds } },
    { projection: { erxesApiId: 1, recipientPhoneNumber: 1 } },
  )) {
    if (call.erxesApiId && call.recipientPhoneNumber) {
      phoneByConversationId.set(call.erxesApiId, call.recipientPhoneNumber);
    }
  }

  const phones = unique([...phoneByConversationId.values()]);
  const customerIdsByPhone = new Map<string, string[]>();

  for await (const customer of Customers.find(
    {
      status: { $ne: 'deleted' },
      $or: [
        { primaryPhone: { $in: phones } },
        { 'phones.phone': { $in: phones } },
      ],
    },
    { projection: { primaryPhone: 1, 'phones.phone': 1 } },
  )) {
    const customerPhones = [
      customer.primaryPhone,
      ...(customer.phones || []).map(({ phone }) => phone),
    ];

    for (const phone of phones) {
      if (customerPhones.includes(phone)) {
        customerIdsByPhone.set(
          phone,
          unique([...(customerIdsByPhone.get(phone) || []), customer._id]),
        );
      }
    }
  }

  const stats = { linked: 0, multiple: 0, noCustomer: 0, noCallRecord: 0 };
  const conversationOps: AnyBulkWriteOperation<IConversationDocument>[] = [];
  const callProCustomerOps: AnyBulkWriteOperation<ICallProCustomerDocument>[] =
    [];

  for (const conversationId of conversationIds) {
    const phone = phoneByConversationId.get(conversationId);

    if (!phone) {
      stats.noCallRecord++;
      continue;
    }

    const customerIds = customerIdsByPhone.get(phone) || [];
    const set: Partial<IConversationDocument> = { callProPhone: phone };

    if (customerIds.length === 1) {
      set.customerId = customerIds[0];
      stats.linked++;
      callProCustomerOps.push({
        updateMany: {
          filter: { phoneNumber: phone, erxesApiId: { $in: [null, ''] } },
          update: { $set: { erxesApiId: customerIds[0] } },
        },
      });
    } else if (customerIds.length > 1) {
      set.callProPotentialCustomerIds = customerIds;
      stats.multiple++;
    } else {
      stats.noCustomer++;
    }

    conversationOps.push({
      updateOne: {
        filter: { _id: conversationId, customerId: { $in: [null, ''] } },
        update: { $set: set },
      },
    });
  }

  console.log(
    `linked=${stats.linked} multiple=${stats.multiple} noCustomer=${stats.noCustomer} noCallRecord=${stats.noCallRecord}`,
  );

  if (isDryRun) {
    console.log('Dry run done. Re-run with DRY_RUN=false to apply.');
    return;
  }

  const affectedIds = conversationOps.map((op) =>
    'updateOne' in op ? op.updateOne.filter._id : undefined,
  );

  const backup = await Conversations.find({
    _id: { $in: affectedIds as string[] },
  }).toArray();

  if (backup.length) {
    await db.collection<IConversationDocument>(BACKUP_COLLECTION).bulkWrite(
      backup.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true,
        },
      })),
      { ordered: false },
    );
    console.log(
      `Backed up ${backup.length} conversation(s) to ${BACKUP_COLLECTION}`,
    );
  }

  let conversationsUpdated = 0;

  for (let i = 0; i < conversationOps.length; i += BATCH_SIZE) {
    const result = await Conversations.bulkWrite(
      conversationOps.slice(i, i + BATCH_SIZE),
      { ordered: false },
    );
    conversationsUpdated += result.modifiedCount;
  }

  let callProCustomersUpdated = 0;

  for (let i = 0; i < callProCustomerOps.length; i += BATCH_SIZE) {
    const result = await CallProCustomers.bulkWrite(
      callProCustomerOps.slice(i, i + BATCH_SIZE),
      { ordered: false },
    );
    callProCustomersUpdated += result.modifiedCount;
  }

  console.log(
    `Done ✅ conversations updated=${conversationsUpdated} customers_callpros updated=${callProCustomersUpdated}`,
  );
};

migrate()
  .then(async () => {
    await client.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await client.close();
    process.exit(1);
  });
