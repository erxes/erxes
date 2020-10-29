import { connect } from '../db/connection';
import { Integrations } from '../db/models';

module.exports.up = async () => {
  await connect();

  await Integrations.updateMany(
    { kind: 'facebook' },
    { $set: { kind: 'facebook-messenger' } }
  );

  return Promise.resolve('ok');
};
