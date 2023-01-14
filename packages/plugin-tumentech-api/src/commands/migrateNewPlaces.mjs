import mongoDb from 'mongodb';
import fs from 'fs';
import Random from 'meteor-random';

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Places;

var command = async () => {
  await client.connect();
  db = client.db();

  Places = db.collection('places');

  const placeData = fs.readFileSync('./places.csv').toLocaleString();


  const placeRows = placeData.split('\n');

  const places = placeRows.map((d) => {
    const columns = d.split(',');
    return {
        _id: Random.id(),
        province: columns[0],
        code: columns[1],
        name: columns[2],
        center: {lat: columns[3], lng: columns[4], description: columns[5]},
    };
  });

  console.log(places);

  await Places.insertMany(places);


//   for (let i = 1; i < cityRows.length; i++) {
//     const columns = cityRows[i].split(',');

//   }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();

