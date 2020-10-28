import { connect } from '../db/connection';
import { Customers } from '../db/models';

module.exports.up = async () => {
  await connect();

  const response = await Customers.updateMany(
    {
      state: { $nin: ['customer', 'lead'] },
      $or: [
        { firstName: { $exists: true, $ne: '' } },
        { lastName: { $exists: true, $ne: '' } }
      ]
    },
    {
      $set: { state: 'lead' }
    }
  );

  console.log(response);
};
