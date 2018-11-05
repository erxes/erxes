import { Users } from '../db/models';
import { connect, disconnect } from '../db/connection';

connect()
  .then(() => {
    // create admin user
    return Users.createUser({
      username: 'admin',
      password: 'erxes',
      email: 'admin@erxes.io',
      isOwner: true,
      role: 'admin',
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
