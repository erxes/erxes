import * as dotenv from 'dotenv';
import * as shelljs from 'shelljs';
import { getEnv } from '../data/utils';
import { connect } from '../db/connection';
import { Users } from '../db/models';

dotenv.config();

const main = async () => {
  const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  const connection = await connect();

  const dbName = connection.connection.db.databaseName;
  console.log(`drop and create database: ${dbName}`);

  await connection.connection.dropDatabase();

  const result = await shelljs.exec(
    `mongorestore --uri "${MONGO_URL}" --db ${dbName} ./src/initialData/common`,
    {
      silent: true
    }
  );
  const output = result.stderr + result.stdout;

  console.log(output);

  console.log(`success, imported initial data to: ${dbName}`);

  const generator = require('generate-password');
  const newPwd = generator.generate({
    length: 10,
    numbers: true,
    lowercase: true,
    uppercase: true
  });

  const pwdHash = await Users.generatePassword(newPwd);

  await shelljs.exec(
    `mongo "${MONGO_URL}" --eval 'db.users.update({}, { $set: {password: "${pwdHash}" } })'`,
    {
      silent: true
    }
  );

  console.log('\x1b[32m%s\x1b[0m', 'Your new password: ' + newPwd);

  process.exit();
};

main();
