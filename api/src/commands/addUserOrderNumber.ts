import * as dotenv from 'dotenv';
import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

dotenv.config();

const main = async () => {
  await connect();

  const users = await Users.find({});

  const formatNumber = n => ('00' + n).slice(-3);

  const doc: any = [];

  let count = 0;

  for (const user of users) {
    doc.push({
      updateOne: {
        filter: {
          _id: user._id
        },
        update: {
          $set: { code: formatNumber(count) }
        }
      }
    });

    count++;
  }

  await Users.bulkWrite(doc);
  await disconnect();

  process.exit();
};

main();
