import { connect } from '../db/connection';
import { Customers } from '../db/models';

module.exports.up = async () => {
  await connect();

  const response = await Customers.updateMany(
    {
      $or: [{ state: { $exists: false } }, { state: '' }],
    },
    {
      $set: { state: 'visitor' },
    },
  );

  console.log(response);
};
