import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

connect()
  .then(() => {
    // create admin user
    return Users.createUser({
      username: 'admin',
      password: 'p4$$w0rd',
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
