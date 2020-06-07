import * as shelljs from 'shelljs';
// import { getEnv } from '../data/utils';
import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

const main = async () => {
  // const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  const result = await shelljs.exec(`mongorestore --db erxes ./src/initialData/common`, { silent: true });
  const output = result.stderr + result.stdout;

  console.log(output);

  connect()
    .then(async () => {
      const generator = require('generate-password');
      const newPwd = generator.generate({
        length: 10,
        numbers: true,
        lowercase: true,
        uppercase: true,
      });

      const pwdHash = await Users.generatePassword(newPwd);

      // find user
      const user = await Users.findOne({ username: 'admin' });

      if (!user) {
        throw new Error('Invalid username');
      }

      // save new password
      await Users.findByIdAndUpdate(
        { _id: user._id },
        {
          password: pwdHash,
        },
      );

      console.log('\x1b[32m%s\x1b[0m', 'Your new password: ' + newPwd);
    })

    .then(() => {
      return disconnect();
    })

    .then(() => {
      process.exit();
    });
};

main();
