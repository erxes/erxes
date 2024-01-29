import { MongoClient } from 'mongodb';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';

const MONGO_URL = process.argv[2] || 'mongodb://localhost:27017/erxes';

console.log('MONGO_URL', MONGO_URL);

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let Customers;
let Polarissyncs;

const command = async () => {
  try {
    await client.connect();
    console.log('Connected to ', MONGO_URL);
    db = client.db();

    Customers = db.collection('customers');
    Polarissyncs = db.collection('polaris_datas');

    const customers = await Customers.find({}).toArray();

    const apiUrl = 'https://crm-api.bid.mn/api/v1';

    for (const customer of customers) {
      const { _id, primaryPhone, code } = customer;

      const polarisData = await Polarissyncs.findOne({ customerId: _id });

      if (polarisData) {
        continue;
      }

      if (!primaryPhone && !code) {
        continue;
      }

      const body: any = {
        customer_code: '',
        phone_number: '',
        register_number: '',
      };

      if (primaryPhone) {
        body.phone_number = primaryPhone;
      }

      if (code) {
        body.register_number = code;
      }

      console.log('fetching data for', body);

      const response = await fetch(`${apiUrl}/user/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status !== 200) {
        // throw new Error('Failed to fetch data');
        console.error('Failed to fetch data');
        continue;
      }

      const res = await response.json();

      if (res.errors) {
        // throw new Error(res.errors[0]);
        console.error(res.errors[0]);
        continue;
      }

      const data = res.data;

      console.log('found data', data);

      await new Promise((resolve) => setTimeout(resolve, 10000));

      await Customers.updateOne(
        { _id: customer._id },
        {
          $set: {
            state: 'customer',
            firstName: data.firstname,
            lastName: data.lastname,
            primaryEmail: res.data.email,
            birthDate: new Date(res.data.birth_date),
            code: res.data.register_number,
          },
        },
      );

      const existingData = await Polarissyncs.findOne({
        customerId: customer._id,
      });

      if (existingData) {
        await Polarissyncs.updateOne(
          { customerId: customer._id },
          { $set: { data: data, updatedAt: new Date() } },
        );
      } else {
        const newDoc = {
          _id: nanoid(),
          customerId: customer._id,
          data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await Polarissyncs.insertOne(newDoc);
      }
    }

    console.log(`Process finished at: ${new Date()}`);

    process.exit();
  } catch (e) {
    console.error(e);
  }
};

command();
