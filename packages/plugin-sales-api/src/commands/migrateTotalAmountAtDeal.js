const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } = process.env;

const client = new MongoClient(MONGO_URL);
let db;

const getTotalAmounts = async (productsData) => {
  const result = {
    totalAmount: 0,
    unUsedTotalAmount: 0,
    bothTotalAmount: 0,
  }

  for (const pData of productsData) {
    result.bothTotalAmount += pData.amount ?? 0;

    if (pData.tickUsed) {
      result.totalAmount += pData.amount ?? 0;
    } else {
      result.unUsedTotalAmount += pData.amount ?? 0;
    }
  }
  return result;
}

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);
  await client.connect();
  db = client.db();

  console.log('connected...');

  const Deals = db.collection('deals');

  let step = 0;
  let per = 1000;

  const summaryCount = await Deals.countDocuments({});

  while (step * per < summaryCount) {
    const skip = step * per;
    console.log(skip, per + skip);
    const deals = await Deals.find({}).sort({ _id: 1 }).skip(skip).limit(per).toArray();

    let bulkOps = [];

    for (const deal of deals) {
      const amounts = await getTotalAmounts(deal.productsData)

      bulkOps.push({
        updateOne: {
          filter: {
            _id: deal._id
          },
          update: {
            $set: {
              ...amounts
            }
          },
          upsert: true
        },
      });
    }
    await Deals.bulkWrite(bulkOps);
    step++
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
