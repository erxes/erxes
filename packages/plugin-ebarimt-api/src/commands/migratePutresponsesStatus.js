const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');


dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);
let db;

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);
  await client.connect();
  db = client.db();

  console.log('connected...');

  PutResponses = db.collection('put_responses');

  try {
    const hasReturnBillIdResponses = await PutResponses.find({
      returnBillId: { $exists: true }
    }).toArray();
    await PutResponses.updateMany(
      {
        billId: { $in: hasReturnBillIdResponses.map(pr => pr.returnBillId) }
      },
      { $set: { status: 'inactive' } }
    );
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
command();
