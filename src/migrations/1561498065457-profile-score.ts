import { connect } from '../db/connection';
import { Customers } from '../db/models';

/**
 * Updating profile scores on customers
 *
 */
module.exports.up = async () => {
  await connect();

  await Customers.ensureIndexes();

  let customerCount = await Customers.countDocuments({ profileScore: { $exists: false } });

  while (customerCount > 0) {
    const bulks = [];

    for (const customer of await Customers.find({ profileScore: { $exists: false } }).limit(200)) {
      bulks.push(await Customers.updateProfileScore(customer._id, false));
      customerCount -= 1;
    }

    await Customers.bulkWrite(bulks);
  }

  return Promise.resolve('ok');
};
