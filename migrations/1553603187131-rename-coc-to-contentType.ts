import { connect } from '../src/db/connection';
import { ActivityLogs } from '../src/db/models';

/**
 * Rename coc field to contentType
 *
 */
module.exports.up = async () => {
  await connect();

  return ActivityLogs.updateMany({}, { $rename: { coc: 'contentType' } });
};
