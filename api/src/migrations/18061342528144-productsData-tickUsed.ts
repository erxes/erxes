import { connect } from '../db/connection';
import { Deals } from '../db/models';

/**
 * Add scopeBranIds field on deal, task, ticket, growthHack
 */

module.exports.up = async () => {
  await connect();

  console.log('start: migrate to productData.tickUsed = true on deal.productsData....');
  const deals = await Deals.find({ productsData: { $exists: true } });

  for (const deal of deals) {
    const productsData = deal.productsData || [];

    for (const pd of productsData) {
      pd.tickUsed = true;
    }

    await Deals.updateOne({ _id: deal._id }, { $set: { productsData } });
  }
};
