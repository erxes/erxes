import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

connect()
  .then(() => {
    // create admin user
    return Users.createUser({
      username: 'admin',
      password: 'erxes',
      email: 'admin@erxes.io',
      isOwner: true,
      details: {
        fullName: 'Admin',
      },
    });
  })

  .then(() => {
    return disconnect();
  })

  .then(() => {
    process.exit();
  });
