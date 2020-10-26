import { connect, disconnect } from '../connection';
import { Automations } from '../models';
import { AUTOMATION_STATUS } from '../models/definitions/constants';

connect()
  .then(async () => {
    await Automations.updateMany({}, { $set: { status: AUTOMATION_STATUS.DELETE } });
  })

  .then(() => {
    return disconnect();
  })

  .then(() => {
    process.exit();
  });
