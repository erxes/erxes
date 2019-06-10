import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { Brands, Customers, Integrations, Segments } from '../src/db/models';

dotenv.config();

/**
 * Updates segment's condition with pairing brandId
 *
 */
module.exports.up = next => {
  const { MONGO_URL = '' } = process.env;

  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
    async () => {
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

        await Segments.update({ _id: segment._id }, { $set: { conditions: updatedConditions } });
      }

      next();
    },
  );
};
