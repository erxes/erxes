import { connect } from '../db/connection';
import { ActivityLogs } from '../db/models';

module.exports.up = async () => {
  await connect();

  return ActivityLogs.deleteMany({ 'content.content.scopeBrandIds': { $exists: true } });
};
