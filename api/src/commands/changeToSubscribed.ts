import * as dotenv from 'dotenv';
import { stream } from '../data/bulkUtils';
import { connect } from '../db/connection';
import { Customers, Companies, Fields } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  const update = async (models, ids, isSubscribed) => {
    await stream(
      async chunk => {
        await models.update(
          { _id: { $in: chunk } },
          { $set: { isSubscribed } },
          { multi: true }
        );
      },
      (variables, root) => {
        const parentIds = variables.parentIds || [];

        parentIds.push(root._id);

        variables.parentIds = parentIds;
      },
      () => {
        return models.find(
          {
            _id: { $in: ids }
          },
          { _id: 1 }
        ) as any;
      },
      1000
    );
  };

  const subscribedCustomers = await Customers.find({
    $or: [{ doNotDisturb: 'No' }, { isSubscribed: { $exists: false } }]
  });

  await update(
    Customers,
    subscribedCustomers.map(e => e._id),
    'Yes'
  );

  const notSubscribedCustomers = await Customers.find({ doNotDisturb: 'Yes' });

  await update(
    Customers,
    notSubscribedCustomers.map(e => e._id),
    'No'
  );

  const subscribedCompanies = await Companies.find({
    $or: [{ doNotDisturb: 'No' }, { isSubscribed: { $exists: false } }]
  });

  await update(
    Companies,
    subscribedCompanies.map(e => e._id),
    'Yes'
  );

  const notSubscribedCompanies = await Companies.find({ doNotDisturb: 'Yes' });

  await update(
    Companies,
    notSubscribedCompanies.map(e => e._id),
    'No'
  );

  await Fields.update(
    { type: 'doNotDisturb', isDefinedByErxes: true },
    { $set: { type: 'isSubscribed', text: 'Subscribed' } }
  );
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
