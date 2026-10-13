import * as dotenv from 'dotenv';
import { AnyBulkWriteOperation, Document, MongoClient } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  DRY_RUN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const isDryRun = DRY_RUN !== 'false';
const client = new MongoClient(MONGO_URL);

const TICKET = 'frontline:ticket';
const CUSTOMER = 'core:customer';
const BATCH_SIZE = 1000;
const PHONE_REGEX = /(?<!\d)[5-9]\d{7}(?!\d)/g;

type Stats = {
  tickets: number;
  alreadyLinked: number;
  noPhone: number;
  noCustomer: number;
  ambiguous: number;
  linked: number;
};

const collectTexts = (node: unknown, texts: string[]) => {
  if (Array.isArray(node)) {
    node.forEach((child) => collectTexts(child, texts));
    return;
  }

  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;

    if (typeof record.text === 'string') {
      texts.push(record.text);
    }

    Object.values(record).forEach((child) => collectTexts(child, texts));
  }
};

const extractText = (value: unknown): string => {
  if (!value) return '';
  if (typeof value !== 'string') return String(value);
  if (!value.trim().startsWith('[')) return value;

  try {
    const texts: string[] = [];
    collectTexts(JSON.parse(value), texts);
    return texts.join(' ');
  } catch {
    return value;
  }
};

const toPhoneKey = (phone: unknown): string | undefined => {
  const digits = String(phone ?? '')
    .replace(/\D/g, '')
    .slice(-8);

  return digits.length === 8 ? digits : undefined;
};

const command = async () => {
  await client.connect();

  const db = client.db();
  const Customers = db.collection('customers');
  const Relations = db.collection('relations');
  const Tickets = db.collection('frontline_tickets');

  console.log(`Process start at: ${new Date().toISOString()}`);
  if (isDryRun) console.log('** DRY RUN — no data will be written **');

  const customersByPhone = new Map<string, Set<string>>();

  const addPhone = (phone: unknown, customerId: string) => {
    const key = toPhoneKey(phone);

    if (!key) return;

    const ids = customersByPhone.get(key) || new Set<string>();
    ids.add(customerId);
    customersByPhone.set(key, ids);
  };

  for await (const customer of Customers.find(
    { status: { $ne: 'deleted' } },
    { projection: { primaryPhone: 1, phones: 1 } },
  )) {
    const customerId = String(customer._id);

    addPhone(customer.primaryPhone, customerId);

    for (const phone of customer.phones || []) {
      addPhone(
        phone && typeof phone === 'object' ? phone.phone : phone,
        customerId,
      );
    }
  }

  console.log(`Indexed ${customersByPhone.size} phone number(s)`);

  const linkedTicketIds = new Set<string>();

  for await (const relation of Relations.find(
    { 'entities.contentType': { $all: [TICKET, CUSTOMER] } },
    { projection: { entities: 1 } },
  )) {
    for (const entity of relation.entities || []) {
      if (entity.contentType === TICKET) {
        linkedTicketIds.add(entity.contentId);
      }
    }
  }

  const stats: Stats = {
    tickets: 0,
    alreadyLinked: 0,
    noPhone: 0,
    noCustomer: 0,
    ambiguous: 0,
    linked: 0,
  };
  const samples: string[] = [];
  let bulkOps: AnyBulkWriteOperation<Document>[] = [];

  const flush = async () => {
    if (!bulkOps.length) return;

    if (!isDryRun) {
      await Relations.bulkWrite(bulkOps, { ordered: false });
    }

    bulkOps = [];
  };

  for await (const ticket of Tickets.find(
    {},
    { projection: { name: 1, description: 1 } },
  )) {
    stats.tickets++;

    const ticketId = String(ticket._id);

    if (linkedTicketIds.has(ticketId)) {
      stats.alreadyLinked++;
      continue;
    }

    const text = `${ticket.name || ''} ${extractText(ticket.description)}`;
    const phones = [...new Set(text.match(PHONE_REGEX) || [])];

    if (!phones.length) {
      stats.noPhone++;
      continue;
    }

    const customerIds = new Set<string>();

    for (const phone of phones) {
      for (const customerId of customersByPhone.get(phone) || []) {
        customerIds.add(customerId);
      }
    }

    if (!customerIds.size) {
      stats.noCustomer++;
      continue;
    }

    if (customerIds.size > 1) {
      stats.ambiguous++;
      continue;
    }

    const [customerId] = [...customerIds];
    const now = new Date();

    bulkOps.push({
      updateOne: {
        filter: {
          $and: [
            {
              entities: {
                $elemMatch: { contentType: TICKET, contentId: ticketId },
              },
            },
            {
              entities: {
                $elemMatch: { contentType: CUSTOMER, contentId: customerId },
              },
            },
          ],
        },
        update: {
          $setOnInsert: {
            entities: [
              { contentType: TICKET, contentId: ticketId },
              { contentType: CUSTOMER, contentId: customerId },
            ],
            createdAt: now,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    });

    stats.linked++;

    if (samples.length < 10) {
      samples.push(
        `${ticketId} | ${phones.join(',')} → ${customerId} | ${String(
          ticket.name || '',
        ).slice(0, 50)}`,
      );
    }

    if (bulkOps.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  console.log(JSON.stringify(stats, null, 2));
  console.log('Samples:');
  samples.forEach((line) => console.log(`  ${line}`));
  console.log(
    isDryRun
      ? `DRY RUN finished — would link ${stats.linked} ticket(s). Re-run with DRY_RUN=false.`
      : `Linked ${stats.linked} ticket(s).`,
  );
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Linking failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
