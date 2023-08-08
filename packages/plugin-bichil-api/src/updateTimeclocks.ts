import { Db, MongoClient } from 'mongodb';
import * as dayjs from 'dayjs';

export const removeAndUpdateTimeclocks = async params => {
  let db;

  const dateFormat = 'YYYY-MM-DD';

  const { MONGO_URL } = process.env;

  const { startDate, endDate } = params;

  const startDateFormatted = new Date(
    dayjs(startDate).format(dateFormat) + ' 00:00'
  );
  const endDateFormatted = new Date(
    dayjs(endDate).format(dateFormat) + ' 00:00'
  );

  console.log(startDateFormatted, endDateFormatted);

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  await client.connect();

  console.log('Connected to mongo server');

  db = client.db('bichil') as Db;

  const agg = await db.collection('timeclocks').aggregate([
    {
      $match: {
        shiftStart: {
          $gte: startDateFormatted,
          $lte: endDateFormatted
        }
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
        docs: { $push: '$$ROOT' },
        count: { $sum: 2 }
      }
    }
  ]);

  try {
    agg.forEach(async group => {
      // if no duplicates found continue
      if (group.docs.length === 1) {
        return;
      }

      const correctShift = group.docs[0];

      let startFromSecond = 1;

      while (startFromSecond < group.docs.length) {
        const getWrongTimeclock = group.docs[startFromSecond];

        const updateShiftEnd =
          getWrongTimeclock.shiftEnd || getWrongTimeclock.shiftStart;

        const outDevice =
          getWrongTimeclock.outDevice || getWrongTimeclock.inDevice;

        await db.collection('timeclocks').updateOne(
          { _id: correctShift._id },
          {
            $set: {
              shiftStart: correctShift.shiftStart,
              shiftEnd: updateShiftEnd,
              shiftActive: false,
              outDevice
            }
          }
        );

        await db
          .collection('timeclocks')
          .deleteOne({ _id: getWrongTimeclock._id });

        startFromSecond += 1;
      }
    });
  } catch (error) {
    console.error(error);
    return error;
  }

  return 'success';
};
