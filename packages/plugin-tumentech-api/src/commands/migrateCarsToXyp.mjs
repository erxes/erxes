import mongoDb from 'mongodb';
import fetch from 'node-fetch';
import { nanoid } from 'nanoid';

const MongoClient = mongoDb.MongoClient;

const MONGO_URL = process.argv[2];

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let Cars;
let Configs;
let XypDatas;

const services = [
  {
    value: 'WS100401_getVehicleInfo',
    label: 'Тээврийн хэрэгслийн мэдээлэл дамжуулах сервис',
  },
  {
    value: 'WS100409_getVehicleInspectionInfo',
    label: 'Тээврийн хэрэгслийн оншилгооний мэдээлэл шалгах сервис',
  },
];

const command = async () => {
  console.log('Connecting to ', MONGO_URL);

  await client.connect();
  console.log('Connected to ', MONGO_URL);
  db = client.db();

  Cars = db.collection('cars');
  Configs = db.collection('configs');
  XypDatas = db.collection('xyp_datas');

  const cars = await Cars.find({
    plateNumber: { $exists: true, $nin: [null, ''] },
  }).toArray();

  const xypConfigs = await Configs.findOne({ code: 'XYP_CONFIGS' });

  const url = `${xypConfigs.value.url}/api`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-language': 'en',
    token: xypConfigs.value.token,
  };

  const createOrUpdate = async (doc) => {
    const existingData = await XypDatas.findOne({
      contentType: 'tumentech:car',
      contentTypeId: doc.contentTypeId,
    });

    const newData = doc.data;

    if (!existingData) {
      doc._id = nanoid();
      await XypDatas.insertOne(doc);
    }

    for (const obj of newData) {
      const serviceIndex = existingData.data.findIndex(
        (e) => e.serviceName === obj.serviceName
      );

      if (serviceIndex === -1) {
        await XypDatas.updateOne(
          { _id: existingData._id },
          {
            $push: {
              data: obj,
            },
          }
        );
      } else {
        existingData.data[serviceIndex] = obj;
        await XypDatas.updateOne(
          { _id: existingData._id },
          {
            $set: {
              data: existingData.data,
            },
          }
        );
      }
    }
  };

  for (const car of cars) {
    console.log('fetching ', car.plateNumber);

    for (const service of services) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            wsOperationName: service.value,
            params: {
              plateNumber: car.plateNumber,
            },
          }),
        });

        const response = await res.json();

        console.log(response);

        const xypData = {
          serviceName: service.value,
          serviceDescription: service.label,
          data: response.return.response,
        };

        const doc = {
          contentType: 'tumentech:car',
          contentTypeId: car._id,
          data: [xypData],
        };

        await createOrUpdate(doc);
      } catch (e) {
        console.log(e);
        continue;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
