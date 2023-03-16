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
let Districts;

var command = async () => {
  await client.connect();
  db = client.db();

  Cities = db.collection('mobinet_cities');
  Districts = db.collection('mobinet_districts');

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

    try {
      console.log('fetching ', url)
      const cityResponse = await fetch(`${url}`, { method: 'GET', headers: headers });

      const response = await cityResponse.json();
  
      if (response.length === 0) {
        continue;
      }
  
      const aimag = response[0];
  
      const doc = {};
  
      doc.nameEn = aimag.display_name.split(',')[0].replace('ö', 'u').replace('ü', 'u');
      doc.boundingBox = aimag.boundingbox.map(item => parseFloat(item));
      doc.geojson = aimag.geojson;
      doc.center = { type: 'Point', coordinates: [parseFloat(aimag.lon), parseFloat(aimag.lat)] }
  
      await Cities.updateOne({ _id: city._id }, { $set: doc });
  
      var districts = await Districts.find({ cityId: city._id }).toArray();
  
      if (districts.length === 0) {
        continue;
      }
  
      for (var district of districts) {
        if (district.name === 'Unknown') {
          continue;
        }
  
        const districtQry = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=1&q=${district.name}%20${name},%20mongolia`
  
        const distResponse = await fetch(`${districtQry}`, { method: 'GET', headers: headers });
  
        const distResponseJson = await distResponse.json();
  
        if (distResponseJson.length === 0) {
          continue;
        }
  
        const sum = distResponseJson[0];
  
        const distDoc = {};
  
        distDoc.nameEn = sum.display_name.split(',')[0].replace('ö', 'u').replace('ü', 'u');
        distDoc.boundingBox = sum.boundingbox.map(item => parseFloat(item));
        distDoc.geojson = sum.geojson;
        distDoc.center = { type: 'Point', coordinates: [parseFloat(sum.lon), parseFloat(sum.lat)] }
  
        await Districts.updateOne({ _id: district._id }, { $set: distDoc });
      }
    }catch(e) {
      console.log(e);
    }

  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
