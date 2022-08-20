import * as dotenv from 'dotenv';

import { sendRequest } from '../../../api-utils/src/requests';
dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Directions: Collection<any>;
let Places: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  const apiKey = process.argv.slice(2)[0];

  Directions = db.collection('directions');
  Places = db.collection('places');

  const directions = await Directions.find({
    $or: [
      {
        googleMapPath: {
          $exists: false
        }
      },
      {
        googleMapPath: null
      },
      {
        googleMapPath: {
          $size: 0
        }
      }
    ]
  }).toArray();

  const getPath = async (placeA: any, placeB: any) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?key=${apiKey}&origin=${placeA.center.lat},${placeA.center.lng}&destination=${placeB.center.lat},${placeB.center.lng}&mode=driving`;

    try {
      const response = await sendRequest({
        url,
        method: 'GET'
      });

      if (response.status !== 'OK' || response.routes.length === 0) {
        console.log(
          `${placeA.name} - ${placeB.name} path not found: ${response.status}`
        );
        return null;
      }

      console.log(`Path found for ${placeA.name} - ${placeB.name}`);
      return response.routes[0].overview_polyline.points;
    } catch {
      console.log(`Error while getting path from google api`);
      return null;
    }
  };

  for (const direction of directions) {
    const placeA = await Places.findOne({ _id: direction.placeIds[0] });
    const placeB = await Places.findOne({ _id: direction.placeIds[1] });

    const path = await getPath(placeA, placeB);

    try {
      await Directions.updateOne(
        { _id: direction._id },
        { $set: { googleMapPath: path } }
      );
    } catch (e) {
      console.log(e);
      continue;
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
