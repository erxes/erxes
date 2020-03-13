import { connect } from '../connection';
import Logs from '../models/Logs';
import { compareObjects } from '../utils';

module.exports.up = async () => {
  await connect();

  const logs = await Logs.find({});

  for (const log of logs) {
    let parsedOldData;
    let parsedNewData;

    try {
      parsedOldData = JSON.parse(log.oldData || '{}');

      if (log.newData) {
        parsedNewData = JSON.parse(log.newData || '{}');
      }
    } catch (e) {
      console.log(e, 'JSON parsing error');
      parsedOldData = JSON.parse(log.oldData.replace('\n', ''));
    }

    switch (log.action) {
      case 'create':
        await Logs.updateOne({ _id: log._id }, { $set: { addedData: log.newData } });
        break;
      case 'update':
        if (log.oldData && log.newData) {
          try {
            const comparison = compareObjects(parsedOldData, parsedNewData);

            await Logs.updateOne(
              { _id: log._id },
              {
                $set: {
                  addedData: JSON.stringify(comparison.added),
                  changedData: JSON.stringify(comparison.changed),
                  unchangedData: JSON.stringify(comparison.unchanged),
                  removedData: JSON.stringify(comparison.removed),
                },
              },
            );
          } catch (e) {
            console.log(e, 'object comparison error');
          }
        }
        break;
      case 'delete':
        await Logs.updateOne({ _id: log._id }, { $set: { removedData: log.oldData } });
        break;
      default:
        break;
    }
  } // end for loop
};
