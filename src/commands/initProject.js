import { Users } from '../db/models';
import { connect, disconnect } from '../db/connection';

export const init = async () => {
  connect();

  // create admin user
  await Users.createUser({
    username: 'admin',
    password: 'p4$$w0rd',
    email: 'admin@erxes.io',
    isOwner: true,
    role: 'admin',
    details: {
      fullName: 'Admin',
    },
  });

  disconnect();
};

init();
