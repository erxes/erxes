const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');
const jsonStream = require('JSONStream');
const { nanoid } = require('nanoid');

const PATH_7MIL = path.join(__dirname, '/test_data.json');

dotenv.config();
const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/?directConnection=true&appName=mongosh+2.1.1',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const sex = {
  Эр: 1,
  Эм: 2,
};

(async () => {
  let arrayToInsert = [];
  let objectCounter = 0;
  let started = Date.now();
  const col = await getCollection();

  const pipeline = fs
    .createReadStream(PATH_7MIL, { flags: 'r', encoding: 'utf-8' })
    .pipe(jsonStream.parse('*'));

  pipeline.on('data', async (customer) => {
    objectCounter++;
    const today = new Date();
    const _id = nanoid();

    const newData = {
      _id,
      firstName: customer.firstName,
      state: 'customer',
      lastName: customer.lastName,
      primaryEmail: customer.primaryEmail,
      modifiedAt: today,
      emails: [customer.primaryEmail],
      birthDate: customer.birthDate ? new Date(customer.birthDate) : undefined,
      primaryPhone: customer.primaryPhone,
      sex: sex[customer.sex],
      createdAt: today,
      searchText: `${customer.primaryEmail || ''} ${customer.firstName || ''} ${customer.lastName || ''}`,
      status: 'Active',
      customFieldsData: [
        {
          field: 'RhQlRgAiDHrojEYYuM6Q',
          value: customer.register_code,
          stringValue: customer.register_code,
        },
        {
          field: 'RhQlRgAiDHrojEYYuM6Q',
          value: customer.id_card_no,
          stringValue: customer.id_card_no,
        },
        {
          field: 'ZEenb1TkJP-dz7TNngzsY',
          value: customer.cus_code,
          stringValue: customer.cus_code,
        },
        {
          field: '6z-FhvmOkX8xH7eBhAm6t',
          value: customer.segment,
          stringValue: customer.segment,
        },
        {
          field: '8k7aQUY7oUN83whuCo14d',
          value: customer.edu,
          stringValue: customer.edu,
        },
        {
          field: 'bbY75NByCZtenWhy7TWXT',
          value: customer.ua,
          stringValue: customer.ua,
        },
        {
          field: 'Bykn-XEGFRzMW9EEXQi__',
          value: customer.work,
          stringValue: customer.work,
        },
        {
          field: 'HYUhUNWeDWH2wHLqAeMYb',
          value: customer.martial,
          stringValue: customer.martial,
        },
        {
          field: 'XYylcuJJa5GUng6i63_pr',
          value: customer.name,
          stringValue: customer.name,
        },
        {
          field: 'jY9v46Fgk2WXz48JzeLy0',
          value: customer.address,
          stringValue: customer.address,
        },
      ],
    };

    arrayToInsert.push(newData);

    if (objectCounter % 100_000 === 0) {
      pipeline.pause();
      console.time(`Inserting time - ${objectCounter}`);
      await col.insertMany(arrayToInsert);
      console.timeEnd(`Inserting time - ${objectCounter}`);
      arrayToInsert = [];

      console.log('--------------\n');
      await new Promise((resolve) => setTimeout(resolve, 100));
      pipeline.resume();
    }
  });
  pipeline.on('error', (error) => {
    console.error('Error parsing JSONL:', error);
  });

  pipeline.on('end', async () => {
    console.log(
      'Operation took - ',
      (Date.now() - started) * 0.001,
      ' seconds\n'
    );
    process.exit();
  });
})();

async function getCollection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();

  console.log('Connected successfully to server');
  const db = client.db('erxes');
  return db.collection('customers');
}
