import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Fields } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  const fields = await Fields.find({
    logicAction: { $exists: true, $ne: null }
  });

  for (const field of fields) {
    let { logics = [] } = field;

    logics = logics.map(e => {
      return {
        fieldId: e.fieldId,
        logicOperator: e.logicOperator,
        logicValue: e.logicValue,
        logicAction: field.logicAction || 'show'
      };
    });

    await Fields.update({ _id: field._id }, { logics });
  }
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
