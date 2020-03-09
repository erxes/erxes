import { connect } from '../db/connection';
import { Customers } from '../db/models';
import { client, getIndexPrefix } from '../elasticsearch';

module.exports.up = async () => {
  await connect();

  const selector = { relatedIntegrationIds: { $exists: false }, integrationId: { $exists: true, $ne: null } };

  console.log('Updating mapping ......');

  try {
    await client.indices.putMapping({
      index: `${getIndexPrefix()}customers`,
      body: {
        properties: {
          relatedIntegrationIds: {
            type: 'keyword',
          },
        },
      },
    });
  } catch (e) {
    console.log(e.message);
  }

  console.log('Found ', await Customers.find(selector).countDocuments());

  const customers = await Customers.find(selector);

  const bulkOptions: any[] = [];

  for (const customer of customers) {
    if (!customer.integrationId) {
      continue;
    }

    bulkOptions.push({
      updateOne: {
        filter: {
          _id: customer._id,
        },
        update: {
          $set: {
            relatedIntegrationIds: [customer.integrationId],
          },
        },
      },
    });
  }

  await Customers.bulkWrite(bulkOptions);

  return Promise.resolve('done');
};
