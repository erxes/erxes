import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { FieldsGroups } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  await FieldsGroups.createSystemGroupsFields();
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
