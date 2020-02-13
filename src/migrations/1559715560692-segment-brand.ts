import { connect } from '../db/connection';

/**
 * Updates segment's condition with pairing brandId
 *
 */
module.exports.up = async () => {
  await connect();

  return Promise.resolve('done');
};
