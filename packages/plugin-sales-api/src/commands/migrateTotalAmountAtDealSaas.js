const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const {
  CORE_MONGO_URL = 'mongodb://127.0.0.1:27017/erxes_core?directConnection=true',
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes_<organizationId>?directConnection=true'
} = process.env;

if (!MONGO_URL || !CORE_MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const coreClient = new MongoClient(CORE_MONGO_URL);
let coredb;

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
  console.log(`start .....`);

  await coreClient.connect();
  coredb = coreClient.db();

  console.log('connected core db...');

  const Organizations = coredb.collection('organizations');
  const orgs = await Organizations.find().toArray();

  for (const org of orgs) {
    try {
      const PER_MONGO_URL = MONGO_URL.replace(
        '<organizationId>',
        org._id.toString(),
      );

      const client = new MongoClient(PER_MONGO_URL);

      await client.connect();
      try {
        const db = client.db();

        console.log('connected...', org.subdomain);

        const Deals = db.collection('deals');

        let step = 0;
        let per = 100;

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

        console.log(`migrating ${org.subdomain}`);

      } catch (e) {
        console.log(e);
        continue;
      } finally {
        console.log('ddddddddddddddddddddddddd')
        client.close();
      }

    } catch (e) {
      console.log(e);
      continue;
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
