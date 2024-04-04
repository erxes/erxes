import * as dotenv from 'dotenv';
import { Collection, Db, MongoClient } from 'mongodb';

dotenv.config();

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Directions: Collection<any>;
let Routes: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Directions = db.collection('directions');
  Routes = db.collection('routes');

  const routes = await Routes.find({}).toArray();

  for (const route of routes) {
    const placesIds = await (
      await Directions.find({ _id: { $in: route.directionIds } }).toArray()
    ).flatMap(direction => direction.placeIds);
    const set = new Set(placesIds);
    await Routes.updateOne(
      { _id: route._id },
      { $set: { placeIds: [...set] } }
    );
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
