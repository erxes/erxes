import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
const { MONGO_URL } = process.env;

// if (!MONGO_URL) {
//   throw new Error(`Environment variable MONGO_URL not set.`);
// }

const client = new MongoClient(MONGO_URL || 'mongodb://localhost/erxes');

let db: Db;

let Users: Collection<any>;
let Positions: Collection<any>;

function generateMongoId() {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  const objectId =
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();
  return objectId;
}

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);

  await client.connect();

  console.log('connected...');
  db = client.db() as Db;

  Positions = db.collection('positions');
  Users = db.collection('users');

  try {
    const getAllUsers = Users.find({
      isActive: true,
      'details.position': { $ne: null },
    });
    const getAllUserPositions = (await getAllUsers.toArray())
      .map((user) => {
        if (user.details.position) {
          const position = user.details.position;
          return position.toLowerCase();
        }

        return;
      })
      .filter((item) => item && item);

    const uniquePositionsArray = Array.from(new Set(getAllUserPositions));
    const docs = uniquePositionsArray.map((positionName) => ({
      _id: generateMongoId(),
      title: positionName,
      code: positionName,
      createdAt: new Date(),
      order: `${positionName}/`,
    }));

    await Positions.insertMany(docs);

    console.log(`Successfully inserted ${docs.length} positions`);
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
