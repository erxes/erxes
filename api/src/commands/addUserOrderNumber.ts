import { connect } from '../db/connection';
import { Users } from '../db/models';

const main = async () => {
  await connect();

  const users = await Users.find().lean();

  const formatNumber = n => ('00' + n).slice(-3);

  users.map(async (user, index) => {
    await Users.update(
      { _id: user._id },
      { $addFields: { code: formatNumber(index) } }
    );
  });

  process.exit();
};

main();
