import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

connect()
  .then(async () => {
    // generate random password
    const generator = require('generate-password');
    const newPwd = generator.generate({
      length: 10,
      numbers: true,
      lowercase: true,
      uppercase: true,
    });

    // create admin user
    const user = await Users.create({
      username: 'admin',
      password: await Users.generatePassword(newPwd),
      email: 'admin@erxes.io',
      isOwner: true,
      details: {
        fullName: 'Admin',
      },
    });

    console.log('\x1b[32m%s\x1b[0m', 'Your new password: ' + newPwd);

    return Users.findOne({ _id: user._id });
  })

  .then(() => {
    return disconnect();
  })

  .then(() => {
    process.exit();
  });
