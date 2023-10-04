import mongoDb from 'mongodb';
import requestify from 'requestify';
import { nanoid } from 'nanoid';

const MongoClient = mongoDb.MongoClient;

const MONGO_URL = process.argv[2];

if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db;

let Customers;
let Configs;
let XypDatas;

const services = [
    {
        value: 'WS100101_getCitizenIDCardInfo',
        label: 'Иргэний үнэмлэхний мэдээлэл дамжуулах сервис',
    },
    {
        value: 'WS100407_getDriverLicenseInfo',
        label: 'Жолоочийн эрхийн мэдээлэл авах',
    },
    {
        value: 'WS100417_specialDriverInfo',
        label: 'Мэргэшсэн жолоочийн мэдээлэл дамжуулах сервис',
    },
];

const command = async () => {
    console.log('Connecting to ', MONGO_URL);

    await client.connect();
    console.log('Connected to ', MONGO_URL);
    db = client.db();

    Customers = db.collection('customers');
    Configs = db.collection('configs');
    XypDatas = db.collection('xyp_datas');

    const drivers = await Customers.find({
        code: { $exists: true },
        code: { $ne: null },
        code: { $ne: '' },
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
            contentType: 'contacts:customer',
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

    for (const driver of drivers) {
        if (driver.code.length !== 10) {
            continue;
        }

        const firstTwoCharacters = driver.code.slice(0, 2);
        if (!/^[А-Яа-я]+$/.test(firstTwoCharacters)) {
            continue;
        }

        const remainingCharacters = driver.code.slice(2);
        if (!/^\d+$/.test(remainingCharacters)) {
            continue;
        }

        console.log('fetching ', driver.code);

        for (const service of services) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
            try {
                const res = await requestify.request(url, {
                    method: 'POST',
                    headers,
                    body: {
                        wsOperationName: service.value,
                        params: {
                            regnum: driver.code,
                        },
                    },
                    dataType: 'json',
                });

                const response = await JSON.parse(res.body);

                const xypData = {
                    serviceName: service.value,
                    serviceDescription: service.label,
                    data: response.return.response,
                };

                const doc = {
                    contentType: 'contacts:customer',
                    contentTypeId: driver._id,
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
