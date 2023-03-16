import mongoDb from 'mongodb';

import requestify from 'requestify';

const MongoClient = mongoDb.MongoClient;

const MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Cities;
let Districts;

const command = async () => {
  await client.connect();
  db = client.db();

  Cities = db.collection('mobinet_cities');
  Districts = db.collection('mobinet_districts');

  const cities = await Cities.find({}).toArray();

  for (const city of cities) {
    if (city.name === 'Unknown') {
      continue;
    }

    const name =
      city.name === 'Улаанбаатар' ? 'Улаанбаатар' : `${city.name}%20аймаг`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&q=${name},%20mongolia`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-language': 'en',
    };

    try {
      console.log('fetching ', url);
      const cityResponse = await requestify.request(url, {
        method: 'GET',
        headers,
      });
      // console.log('cityResponse ', cityResponse);

      const response = await JSON.parse(cityResponse.body);

      console.log('response ', response);

      if (response.length === 0) {
        continue;
      }

      const aimag = response[0];

      const doc = {};

      doc.nameEn = aimag.display_name
        .split(',')[0]
        .replace('ö', 'u')
        .replace('ü', 'u');
      doc.boundingBox = aimag.boundingbox.map((item) => parseFloat(item));
      doc.geojson = aimag.geojson;
      doc.center = {
        type: 'Point',
        coordinates: [parseFloat(aimag.lon), parseFloat(aimag.lat)],
      };

      await Cities.updateOne({ _id: city._id }, { $set: doc });

      const districts = await Districts.find({ cityId: city._id }).toArray();

      if (districts.length === 0) {
        continue;
      }

      for (const district of districts) {
        if (district.name === 'Unknown') {
          continue;
        }

        const districtQry = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&q=${district.name}%20${name},%20mongolia`;

        const distResponse = await requestify.request(districtQry, {
          method: 'GET',
          headers,
        });

        const distResponseJson = await JSON.parse(distResponse.body);
        console.log('distResponseJson ', distResponseJson);

        if (distResponseJson.length === 0) {
          continue;
        }

        const sum = distResponseJson[0];

        const distDoc = {};

        distDoc.nameEn = sum.display_name
          .split(',')[0]
          .replace('ö', 'u')
          .replace('ü', 'u');
        distDoc.boundingBox = sum.boundingbox.map((item) => parseFloat(item));
        distDoc.geojson = sum.geojson;
        distDoc.center = {
          type: 'Point',
          coordinates: [parseFloat(sum.lon), parseFloat(sum.lat)],
        };

        await Districts.updateOne({ _id: district._id }, { $set: distDoc });
      }
    } catch (e) {
      console.log(e);
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
