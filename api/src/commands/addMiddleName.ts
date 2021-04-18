import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Fields, FieldsGroups } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  //   await Fields.remove({ isDefinedByErxes: true });
  const fieldGroup = await FieldsGroups.findOne({
    isDefinedByErxes: true,
    contentType: 'customer'
  });

  if (!fieldGroup) {
    return;
  }

  await Fields.createField({
    text: 'Middle Name',
    type: 'middleName',
    canHide: false,
    groupId: fieldGroup._id,
    contentType: 'customer',
    isDefinedByErxes: true
  });
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
