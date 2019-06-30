import { connect } from '../src/db/connection';
import { Brands, Customers, Integrations, Segments } from '../src/db/models';

/**
 * Updates segment's condition with pairing brandId
 *
 */
module.exports.up = async () => {
  await connect();

  const segments = await Segments.find({ conditions: { $exists: true } });

  for (const segment of segments) {
    const { conditions = [] } = segment;

    const updatedConditions: any[] = [];

    for (const condition of conditions) {
      const updatedCondition: any = condition;

      if (condition.field.startsWith('messengerData.customData')) {
        const lastCustomers = await Customers.find({
          $and: [
            { [condition.field]: { $exists: true } },
            { [condition.field]: { $ne: null } },
            { [condition.field]: { $ne: {} } },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        const [lastCustomer] = lastCustomers;

        const integration = await Integrations.findOne({ _id: lastCustomer.integrationId });

        if (!integration) {
          return;
        }

        const brand = await Brands.findOne({ _id: integration.brandId });

        if (!brand) {
          return;
        }

        updatedCondition.brandId = brand._id;
      }

      updatedConditions.push(updatedCondition);
    }

    await Segments.updateOne({ _id: segment._id }, { $set: { conditions: updatedConditions } });
  }

  return Promise.resolve('done');
};
