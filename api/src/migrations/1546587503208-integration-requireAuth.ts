import { connect } from '../db/connection';
import { Integrations } from '../db/models';

/**
 * Updating messenger integration's require auth to true
 *
 */
module.exports.up = async () => {
  await connect();

  return Integrations.updateMany(
    { kind: 'messenger' },
    { $set: { 'messengerData.requireAuth': true } }
  );
};
