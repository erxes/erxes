import { findUnfinishedShiftsAndUpdate } from '../utils';
import { Db, MongoClient } from 'mongodb';
import * as dayjs from 'dayjs';
import { generateModels } from '../connectionResolver';

// check if duplicate timeclocks exist per day
const checkTimeclocksAndUpdate = async (subdomain: any) => {
  let db: Db;

  const { MONGO_URL } = process.env;
  const models = await generateModels(subdomain);

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    console.log('Connected to mongo server');

    db = client.db('bichil-erxes') as Db;

    const NOW = new Date();
    const YESTERDAY = dayjs(new Date())
      .add(-1, 'day')
      .toDate();

    const agg = await db
      .collection('timeclocks')
      .aggregate([
        {
          $match: {
            shiftStart: {
              $gte: YESTERDAY,
              $lte: NOW
            },
            deviceType: { $regex: /^(?!.*shift request).*/gi },
            $or: [
              { shiftNotClosed: false },
              { shiftNotClosed: { $exists: false } }
            ]
          }
        },
        {
          $sort: {
            shiftStart: 1
          }
        },

        {
          $group: {
            _id: '$userId',
            docs: { $push: '$$ROOT' }
          }
        }
      ])
      .toArray();

    const bulkWriteOps: any[] = [];

    for (const a of agg) {
      const timeclocksPerUser = a.docs;
      let updateDoc;
      const deleteIds: string[] = [];

      if (timeclocksPerUser && timeclocksPerUser.length > 1) {
        // if more than one shift exists
        // get the earliest shift start
        // if no shift end, check shift start
        // find the latest shift start/end

        const shiftStart = timeclocksPerUser[0].shiftStart;
        updateDoc = timeclocksPerUser[0];

        let shiftEnd = timeclocksPerUser[0].shiftEnd || shiftStart;

        let outDevice = timeclocksPerUser[1].shiftActive
          ? timeclocksPerUser[1].inDevice
          : timeclocksPerUser[1].outDevice;

        let outDeviceType = timeclocksPerUser[1].shiftActive
          ? timeclocksPerUser[1].inDeviceType
          : timeclocksPerUser[1].outDeviceType;

        for (let i = 1; i < timeclocksPerUser.length; i++) {
          const findClockOutTime =
            timeclocksPerUser[i].shiftEnd || timeclocksPerUser[i].shiftStart;
          if (dayjs(findClockOutTime) > dayjs(shiftEnd)) {
            deleteIds.push(timeclocksPerUser[i]._id);

            shiftEnd = findClockOutTime;
            outDevice = timeclocksPerUser[i].shiftActive
              ? timeclocksPerUser[i].inDevice
              : timeclocksPerUser[i].outDevice;

            outDeviceType = timeclocksPerUser[i].shiftActive
              ? timeclocksPerUser[i].inDeviceType
              : timeclocksPerUser[i].outDeviceType;
          }
        }

        // update one doc, delete the rest timeclocks of the day
        bulkWriteOps.push({
          updateOne: {
            filter: { _id: updateDoc._id },
            update: {
              $set: {
                ...updateDoc,
                shiftStart,
                shiftEnd,
                shiftActive: false,
                outDevice,
                outDeviceType
              }
            }
          }
        });

        bulkWriteOps.push({
          deleteMany: { filter: { _id: { $in: deleteIds } } }
        });
      }
    }

    if (bulkWriteOps.length) {
      await models?.Timeclocks.bulkWrite(bulkWriteOps);
    }

    console.log('duplicate shifts  ', new Date());
    return 'success';
  } catch (error) {
    console.log('error ', error.message);
    return error.message;
  }
};

const updateTimeclocks = async (subdomain: any) => {
  let db: Db;

  const { MONGO_URL } = process.env;

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  console.log('unfinished shifts  ', new Date());

  await client.connect();
  console.log('Connected to mongo server');

  db = client.db('erxes') as Db;

  const NOW = dayjs(new Date()).format('YYYY-MM-DD HH:mm');

  const bulkWriteResult = await findUnfinishedShiftsAndUpdate(subdomain);

  if (bulkWriteResult) {
    await db
      .collection('bichil_unfinished_shifts')
      .insertOne({
        createdAt: NOW,
        totalCount: bulkWriteResult.modifiedCount
      })
      .catch(async err => {
        console.error(err);
        await db.collection('bichil_unfinished_shifts').insertOne({ err });
      });
  }

  console.log('Created log at ' + NOW);
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await checkTimeclocksAndUpdate(subdomain);
    await updateTimeclocks(subdomain);
  }
};
