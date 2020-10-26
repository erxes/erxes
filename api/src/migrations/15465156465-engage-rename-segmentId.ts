import { connect } from '../db/connection';
import { EngageMessages } from '../db/models';

/**
 * Rename engage's segmentId to segmentIds
 *
 */
module.exports.up = async () => {
  await connect();

  await EngageMessages.find()
    .cursor()
    .eachAsync((e: any) => {
      if (!e.segmentId) {
        return;
      }

      if (e.segmentIds) {
        return;
      }

      e.segmentIds = [e.segmentId];
      e.save();
    });

  return Promise.resolve('done');
};
