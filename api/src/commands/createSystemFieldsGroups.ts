import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Fields, FieldsGroups } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  await Fields.deleteMany({ isDefinedByErxes: true });
  await FieldsGroups.deleteMany({ isDefinedByErxes: true });

  await FieldsGroups.createSystemGroupsFields();
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
