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

  PosOrders = db.collection('pos_orders');
  let bulkUpdateOps = [];
  let counter = 0;
  let bulkCounter = 0;


  try {
    const orders = await PosOrders.find().toArray();

    for (const order of orders) {
      if (order.paidAmounts && order.paidAmounts.length) {
        continue;
      }

      const paidAmounts = [];
      if (order.receivableAmount) {
        paidAmounts.push({
          _id: Math.random().toString(),
          type: 'receivable',
          amount: order.receivableAmount
        });
      }

      if (order.cardAmount) {
        paidAmounts.push({
          _id: Math.random().toString(),
          type: 'card',
          amount: order.cardAmount
        });
      }

      bulkUpdateOps.push({
        updateOne: {
          filter: {
            _id: order._id
          },
          update: {
            $set: {
              paidAmounts
            }
          }
        }
      });
      counter = counter + 1;

      if (counter > 1000) {
        bulkCounter = bulkCounter + 1;
        console.log(`updated ${bulkCounter * 1000}...`);
        await PosOrders.bulkWrite(bulkUpdateOps);
        counter = 0;
      }
    }

    if (bulkUpdateOps.length) {
      console.log(`updated ${bulkCounter * 1000 + bulkUpdateOps.length}...`);
      await PosOrders.bulkWrite(bulkUpdateOps);
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
command();

