import { connect } from '../db/connection';
import { ActivityLogs } from '../db/models';

/**
 * Rename coc field to contentType
 *
 */
module.exports.up = async () => {
  await connect();

  return ActivityLogs.updateMany({}, { $rename: { coc: 'contentType' } });
};
