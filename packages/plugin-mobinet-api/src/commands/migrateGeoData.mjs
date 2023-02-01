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

let Cities;
let Districts;
let Quarters;

var command = async () => {
  await client.connect();
  db = client.db();

  Cities = db.collection('mobinet_cities');
  Districts = db.collection('mobinet_districts');
  Quarters = db.collection('mobinet_quarters');

  const cityData = fs.readFileSync('./smartdata/cities.csv').toLocaleString();
  const districtData = fs
    .readFileSync('./smartdata/district.csv')
    .toLocaleString();
  const quarterData = fs
    .readFileSync('./smartdata/quarters.csv')
    .toLocaleString();

  const cityRows = cityData.split('\n');
  const districtRows = districtData.split('\n');
  const quarterRows = quarterData.split('\n');

  const districts = districtRows.map((d) => {
    const columns = d.split(',');
    return {
      idOnSheet: columns[0],
      name: columns[1],
      code: columns[2],
      cityId: columns[3],
    };
  });

  const quarters = quarterRows.map((q) => {
    const columns = q.split(',');
    return {
      idOnSheet: columns[0],
      name: columns[1],
      code: columns[2],
      order: columns[3],
      cityId: columns[5],
      districtId: columns[6],
    };
  });

  for (let i = 1; i < cityRows.length; i++) {
    const columns = cityRows[i].split(',');
    const idOnSheet = columns[0];

    if (idOnSheet) {
      const city = {
        _id: Random.id(),
        name: columns[1],
        code: columns[2],
        iso: columns[3],
        stat: columns[4],
      };
      const c = await Cities.insertOne(city);
      console.log(c.insertedId);

      const cityDistricts = districts.filter((d) => d.cityId === idOnSheet);
      for (let j = 0; j < cityDistricts.length; j++) {
        const district = cityDistricts[j];
        const d = await Districts.insertOne({
          _id: Random.id(),
          name: district.name,
          code: district.code,
          cityId: c.insertedId,
        });
        console.log(d.insertedId);

        const districtQuarters = quarters.filter(
          (q) => q.districtId === district.idOnSheet
        );
        for (let k = 0; k < districtQuarters.length; k++) {
          const quarter = districtQuarters[k];
          const q = await Quarters.insertOne({
            _id: Random.id(),
            name: quarter.name,
            code: quarter.code,
            order: quarter.order,
            cityId: c.insertedId,
            districtId: d.insertedId,
          });
          console.log(q.insertedId);
        }
      }
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
