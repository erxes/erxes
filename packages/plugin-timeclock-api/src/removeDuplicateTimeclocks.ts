import { Db, MongoClient } from 'mongodb';

export const removeDuplicates = async () => {
  let db: Db;

  const { MONGO_URL } = process.env;

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  await client.connect();
  console.log('Connected to mongo server');

  db = client.db('erxes') as Db;

  const agg = db.collection('timeclocks').aggregate([
    {
      $group: {
        _id: {
          shiftStart: '$shiftStart',
          userId: '$userId'
          // Add more fields as necessary
        },
        duplicates: {
          $addToSet: '$_id'
        },
        count: {
          $sum: 1
        }
      }
    },
    {
      $match: {
        count: {
          $gt: 1
        }
      }
    }
  ]);

  agg.forEach(async group => {
    const duplicates = group.duplicates;
    const deleteIds = duplicates.slice(1); // Delete all other documents' _ids
    await db.collection('timeclocks').remove({
      _id: {
        $in: deleteIds
      }
    });
  });

  console.log('successs');
};
