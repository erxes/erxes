import { connect } from '../db/connection';
import { Customers } from '../db/models';

module.exports.up = async () => {
  await connect();

  const response = await Customers.updateMany(
    {
      state: { $exists: false },
      $or: [
        { visitorContactInfo: { $exists: true } },
        { primaryEmail: { $exists: true } },
        { primaryPhone: { $exists: true } },
      ],
    },
    {
      $set: { state: 'lead' },
    },
  );

  console.log(response);
};
