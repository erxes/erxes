import * as shelljs from 'shelljs';
import { getEnv } from '../data/utils';
import { Users } from '../db/models';

const main = async () => {
  const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  const result = await shelljs.exec(`mongorestore --db erxes ./initialData`, { silent: true });
  const output = result.stderr + result.stdout;

  console.log(output);

  const generator = require('generate-password');
  const newPwd = generator.generate({
    length: 10,
    numbers: true,
    lowercase: true,
    uppercase: true,
  });

  const pwdHash = await Users.generatePassword(newPwd);

  await shelljs.exec(`mongo ${MONGO_URL} --eval 'db.users.update({}, { $set: {password: "${pwdHash}" } })'`, {
    silent: true,
  });

  console.log('\x1b[32m%s\x1b[0m', 'Your new password: ' + newPwd);

  process.exit();
};

main();
