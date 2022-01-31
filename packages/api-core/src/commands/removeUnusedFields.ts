import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Fields, FieldsGroups } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  const fields = await Fields.find({
    isDefinedByErxes: false,
    contentType: { $ne: 'form' }
  });

  for (const field of fields) {
    const fieldGroup = await FieldsGroups.findOne({ _id: field.groupId });

    if (!fieldGroup) {
      await Fields.removeField(field.id);
    }
  }
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
