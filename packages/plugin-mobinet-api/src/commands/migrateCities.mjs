import mongoDb from 'mongodb';
import fetch from 'node-fetch';

var MongoClient = mongoDb.MongoClient;

var MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

var client = new MongoClient(MONGO_URL);

console.log('Connected to ', MONGO_URL);

let db;

let Cities;

var command = async () => {
  await client.connect();
  db = client.db();

  Cities = db.collection('mobinet_cities');

  var cities = await Cities.find({}).toArray();

  for (var city of cities) {
    if (city.name === 'Unknown') {
        continue;
    }

    var name = city.name === 'Улаанбаатар' ? 'Улаанбаатар' : `${city.name} аймаг`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&q=${name},%20mongolia`

    var headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-language': 'en'
    }

    await fetch(`${url}`, {method: 'GET', headers: headers})
    .then(response => response.text())
    .then(async result => {
      try {
        var res = JSON.parse(result);

        const aimag = res[0];

        const doc = {};

        doc.nameEn = aimag.display_name.split(',')[0].replace('ö','u').replace('ü','u');
        doc.boundingBox = aimag.boundingbox.map(item => parseFloat(item));
        doc.geojson = aimag.geojson;
        doc.center = {type: 'Point', coordinates: [parseFloat( aimag.lon), parseFloat(aimag.lat)]}

        await Cities.updateOne({ _id: city._id }, { $set: doc});

        console.log('res', res);
      } catch (error) {
        console.log('error', error);
      }
    })
    .catch(error => console.log('error', error));
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
