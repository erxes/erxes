import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { Customers } from '../src/db/models';

dotenv.config();

/**
 * Updating profile scores on customers
 *
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
      await Customers.ensureIndexes();
      let customerCount = await Customers.countDocuments({ profileScore: { $exists: false } });
      while (customerCount > 0) {
        console.log(customerCount);
        // tslint:disable-next-line:no-shadowed-variable
        const bulks = [];
        for (const customer of await Customers.find({ profileScore: { $exists: false } }).limit(200)) {
          bulks.push(await Customers.updateProfileScore(customer._id, false));
          customerCount -= 1;
        }
        await Customers.bulkWrite(bulks);
      }
      next();
    },
  );
};
