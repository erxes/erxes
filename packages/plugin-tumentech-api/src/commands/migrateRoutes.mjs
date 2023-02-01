import * as dotenv from 'dotenv';
import mongoDb from 'mongodb';

dotenv.config();

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Routes;
let Directions;
let Places;

var command = async () => {
  await client.connect();
  db = client.db();

  Routes = db.collection('routes');
  Directions = db.collection('directions');
  Places = db.collection('places');

  const routes = await Routes.find({}).toArray();

  for (const route of routes) {
    const directionIds = route.directionIds;

    const startDir = await Directions.findOne({
      _id: directionIds[0],
    });

    const endDir = await Directions.findOne({
      _id: directionIds[directionIds.length - 1],
    });

    const startPlace = await Places.findOne({
      _id: startDir.placeIds[0],
    });

    const endPlace = await Places.findOne({
      _id: endDir.placeIds[endDir.placeIds.length - 1],
    });

    let placeName = `${startPlace.province} : ${startPlace.name}`;
    let secondaryPlaceName = `${endPlace.province} : ${endPlace.name}`;

    if (startPlace.province === 'ulaanbaatar') {
      placeName = startPlace.name;
    }

    if (endPlace.province === 'ulaanbaatar') {
      secondaryPlaceName = endPlace.name;
    }

    if (startPlace.province === 'tuv') {
      placeName = `Төв : ${startPlace.name}`;
      await Places.updateOne(
        { _id: startPlace._id },
        { $set: { province: 'Төв' } }
      );
    }

    if (endPlace.province === 'tuv') {
      secondaryPlaceName = `Төв : ${endPlace.name}`;
      await Places.updateOne(
        { _id: endPlace._id },
        { $set: { province: 'Төв' } }
      );
    }

    const searchText = `${placeName} ${secondaryPlaceName}`;
    const name = `${placeName} - ${secondaryPlaceName}`;

    // console.log(searchText);
    console.log(name);

    await Routes.updateOne(
      { _id: route._id },
      { $set: { searchText, name, placeName, secondaryPlaceName } }
    );

    await Routes.updateOne(
      { _id: route._id },
      { $unset: { placesIds: 1, placeIds: 1 } }
    );
  }

  const places = await Places.find({}).toArray();

  for (const place of places) {
    const { center } = place;
    console.log({
      lat: parseFloat(center.lat),
      lng: parseFloat(center.lng),
      description: center.description,
    });

    await Places.updateOne(
      { _id: place._id },
      {
        $set: {
          center: {
            lat: parseFloat(center.lat),
            lng: parseFloat(center.lng),
            description: center.description,
          },
        },
      }
    );
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
