import { connect } from '../src/db/connection';
import { Pipelines } from '../src/db/models';

module.exports.up = async () => {
  await connect();

  await Pipelines.updateMany({}, { $set: { visibility: 'public' } });

  return Promise.resolve('ok');
};
