import { connect } from '../src/db/connection';
import { Integrations } from '../src/db/models';

/**
 * Updating messenger integration's require auth to true
 *
 */
module.exports.up = async () => {
  await connect();

  return Integrations.updateMany({ kind: 'messenger' }, { $set: { 'messengerData.requireAuth': true } });
};
