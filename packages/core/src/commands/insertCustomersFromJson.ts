import * as readline from 'readline';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';

dotenv.config();
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;
let Customers: Collection<any>;

const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide the path to the JSON file as an argument.');
  console.log('Usage: node insertCustomers.js <path_to_json_file>');
  process.exit(1); // Exit with error code
}

const command = async () => {
  console.log('connection db...');

  await client.connect();

  db = client.db();

  console.log('connected db successfully');

  Customers = db.collection('customers');

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

  const rl = readline.createInterface({ input: fileStream });

  let batch: any = [];
  const batchSize = 1000;

  rl.on('line', async (line) => {
    try {
      const customer = JSON.parse(line);
      batch.push(customer);

      // Insert in batches
      if (batch.length >= batchSize) {
        await Customers.insertMany(batch); // Insert batch
        batch = []; // Reset batch
        console.log(`Inserted ${batchSize} records`);
      }
    } catch (err) {
      console.error('Error parsing or inserting data:', err);
    }
  });

  rl.on('close', async () => {
    if (batch.length > 0) {
      await Customers.insertMany(batch); // Insert remaining records
      console.log(`Inserted ${batch.length} remaining records`);
    }
    console.log('Finished inserting all records');
  });
  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
