import { MongoClient } from 'mongodb';

// const MongoClient = mongoDb.MongoClient;
const MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });

console.log('Connected to ', MONGO_URL);

let db;

let Buildings;
let Quarters;
let Districts;
let Cities;

const command = async () => {
  await client.connect();
  db = client.db();
  Buildings = db.collection('mobinet_buildings');
  Quarters = db.collection('mobinet_quarters');
  Districts = db.collection('mobinet_districts');
  Cities = db.collection('mobinet_cities');

  const buildingList = await Buildings.find({}).toArray();
  // create buildings
  for (let i = 0; i < buildingList.length; i++) {
    // console.log(buildingList[i]);
    let one = buildingList[i];
    const quarter = await Quarters.findOne({
      _id: one.quarterId || '',
    });
    const district = await Districts.findOne({
      _id: quarter.districtId || '',
    });
    const city = await Cities.findOne({
      _id: district.cityId || '',
    });
    // console.log(`${one.name} ${city.name} ${district.name}  ${quarter.name}`);
    one.searchText = `${one.name} ${city.name} ${district.name}  ${quarter.name}`;
    const { _id, ...doc } = one;

    await Buildings.updateOne({ _id: one._id }, { $set: doc });
  }

  console.log(`Process finished`);

  process.exit();
};
command();
