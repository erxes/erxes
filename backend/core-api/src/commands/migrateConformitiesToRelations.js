const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } = process.env;

const client = new MongoClient(MONGO_URL);
let db;
let Conformities;
let Relations;

const confTypeRelType = {
  'customer': 'core:customer',
  'company': 'core:company',
  'deal': 'sales:deal',
}

const command = async () => {
  await client.connect();
  console.log(Boolean(client))
  db = client.db();
  console.log(Boolean(db))

  Conformities = db.collection('conformities');
  Relations = db.collection('relations');
  await Relations.createIndex({ _conformityId: 1 });
  await Conformities.createIndex({ _synced: 1 });

  const now = new Date();
  console.log(`Process start at: ${new Date()}`);

  let step = 0;
  let per = 1000;

  const conformityFilter = {
    _synced: { $ne: true },
    $or: [
      { mainType: 'deal', relType: 'customer' },
      { mainType: 'deal', relType: 'company' },
      { mainType: 'customer', relType: 'deal' },
      { mainType: 'company', relType: 'deal' },
    ]
  }
  const summaryCount = await Conformities.countDocuments(conformityFilter);
  while (step * per < summaryCount) {
    const skip = step * per;
    const conformities = await Conformities.find({ ...conformityFilter }).sort({ _id: 1 }).skip(skip).limit(per).toArray();
    console.log(skip, per, conformities[0]?._id)

    let bulkOps = [];
    for (const conformity of conformities) {
      bulkOps.push({
        updateOne: {
          filter: {
            _conformityId: conformity._id
          },
          update: {
            $set: {
              entities: [
                {
                  contentType: confTypeRelType[conformity.mainType],
                  contentId: conformity.mainTypeId
                },
                {
                  contentType: confTypeRelType[conformity.relType],
                  contentId: conformity.relTypeId
                }
              ],
              _conformityId: conformity._id,
            },
            $setOnInsert: {
              createdAt: now,
              updatedAt: now,
            }
          },
          upsert: true
        },
      });
    }
    if (bulkOps.length) {
      await Relations.bulkWrite(bulkOps)
      await Conformities.updateMany({ _id: { $in: conformities.map(c => c._id) } }, { $set: { _synced: true } })
    }
    step++
  }

  console.log(`Process finished at: ${now}`);

  process.exit();
};

command();
