import { connect } from '../db/connection';
import { Pipelines } from '../db/models';

module.exports.up = async () => {
  await connect();

  await Pipelines.updateMany({}, { $set: { visibility: 'public' } });

  return Promise.resolve('ok');
};
