import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

connect()
  .then(async () => {
    // create admin user
    const user = await Users.createUser({
      username: 'admin',
      password: 'erxes',
      email: 'admin@erxes.io',
      isOwner: true,
      details: {
        fullName: 'Admin',
      },
    });

    await Users.updateOne({ _id: user._id }, { $set: { isOwner: true } });

    return Users.findOne({ _id: user._id });
  })

  .then(() => {
    return disconnect();
  })

  .then(() => {
    process.exit();
  });
