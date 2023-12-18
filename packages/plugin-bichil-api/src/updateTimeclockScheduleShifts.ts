import { Db, MongoClient } from 'mongodb';
import * as dayjs from 'dayjs';

export const findAndUpdateTimeclockScheduleShifts = async params => {
  let db;

  const dateFormat = 'YYYY-MM-DD';

  const timeFormat = 'HH:mm';

  const { MONGO_URL } = process.env;

  const { startDate, endDate } = params;

  const startDateFormatted = new Date(
    dayjs(startDate).format(dateFormat) + ' 00:00'
  );
  const endDateFormatted = new Date(
    dayjs(endDate).format(dateFormat) + ' 00:00'
  );

  if (!MONGO_URL) {
    throw new Error(`Environment variable MONGO_URL not set.`);
  }

  const client = new MongoClient(MONGO_URL);

  await client.connect();

  console.log('Connected to mongo server');

  db = client.db('bichil-erxes') as Db;

  const query = {
    scheduleId: { $exists: true },
    shiftStart: {
      $gte: startDateFormatted,
      $lte: endDateFormatted
    },
    shiftEnd: {
      $gte: startDateFormatted,
      $lte: endDateFormatted
    }
  };

  const scheduleShifts = await db
    .collection('timeclock_schedule_shifts')
    .find(query)
    .toArray();

  //if starts from 9:30 -> lunchBreakInMins = 30 update shift end 17:30 to 17:00
  //if starts from 9:00 -> update shift end 18:00 to 17:00

  const bulkOps: any = [];

  for (const scheduleShift of scheduleShifts) {
    const { shiftStart, shiftEnd, _id } = scheduleShift;
    const getTime = dayjs(shiftStart).format(timeFormat);

    if (getTime === '09:30') {
      const updatedShiftEnd = new Date(
        new Date(shiftEnd).getTime() - 30 * 60 * 1000
      ); // Subtracting 30 mins in milliseconds

      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { $set: { shiftEnd: updatedShiftEnd, lunchBreakInMins: 30 } }
        }
      });
    }

    if (getTime === '09:00') {
      const updatedShiftEnd = new Date(
        new Date(shiftEnd).getTime() - 60 * 60 * 1000
      ); // Subtracting 1 hour in milliseconds

      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { $set: { shiftEnd: updatedShiftEnd } }
        }
      });
    }
  }

  try {
    if (bulkOps.length) {
      await db.collection('timeclock_schedule_shifts').bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error(error);
    return error;
  }

  return 'success';
};
