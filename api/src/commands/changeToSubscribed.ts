import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Customers, Companies, Fields } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  const subscribedCustomers = await Customers.find({
    $or: [{ doNotDisturb: 'No' }, { isSubscribed: { $exists: false } }]
  });

  await Customers.update(
    { _id: { $in: subscribedCustomers.map(e => e._id) } },
    { $set: { isSubscribed: 'Yes' } },
    { multi: true }
  );

  const notSubscribedCustomers = await Customers.find({ doNotDisturb: 'Yes' });

  await Customers.update(
    { _id: { $in: notSubscribedCustomers.map(e => e._id) } },
    { $set: { isSubscribed: 'No' } },
    { multi: true }
  );

  const subscribedCompanies = await Companies.find({
    $or: [{ doNotDisturb: 'No' }, { isSubscribed: { $exists: false } }]
  });

  await Companies.update(
    { _id: { $in: subscribedCompanies.map(e => e._id) } },
    { $set: { isSubscribed: 'Yes' } },
    { multi: true }
  );

  const notSubscribedCompanies = await Companies.find({ doNotDisturb: 'Yes' });

  await Companies.update(
    { _id: { $in: notSubscribedCompanies.map(e => e._id) } },
    { $set: { isSubscribed: 'No' } },
    { multi: true }
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
